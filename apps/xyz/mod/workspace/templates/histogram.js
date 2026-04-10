/**
### /workspace/templates/histogram

The query returns data organised in a specified number of buckets in order to visualise histogram for continuous data.

The query uses the `percentile_cont` function to calculate the 2nd and 98th percentiles of the specified field.

The query also calculates the minimum and maximum values of the specified field.

The buckets returned is actual the number of buckets defined + 2. Buckets default to 7.

A decimal value can be provided for the bucket min and max values. The default is 0 to round to the nearest integer.

This is because the first bucket is for values less than or equal to the 2nd percentile and the last bucket is for values greater than or equal to the 98th percentile.

The rest of the buckets are calculated by dividing the range between the 2nd and 98th percentiles into equal intervals.

If the parameter "chartjs" is set to true, the query returns a chart.js compatible string.
Otherwise, the query returns the final data as a table.

@module /workspace/templates/histogram
*/
export default (_) => {
  const decimals = parseInt(_.decimals) || 0;
  const buckets = parseInt(_.buckets) || 7;

  let bucketCases = '';
  for (const i of Array(buckets).keys()) {
    bucketCases += `WHEN ${_.field} < p2 + ${i + 1} * (p98 - p2) / ${buckets} THEN ${i + 1} \n`;
  }

  const sqlString = `
    WITH percentiles AS (
        SELECT
            percentile_cont(0.02) WITHIN GROUP (ORDER BY ${_.field}) AS p2,
            percentile_cont(0.98) WITHIN GROUP (ORDER BY ${_.field}) AS p98,
            MIN(${_.field}) AS actual_min,
            MAX(${_.field}) AS actual_max
        FROM \${table}
        WHERE ${_.field} is not null and true \${filter} \${viewport}),

    buckets AS (
        SELECT 
            CASE 
                WHEN ${_.field} <= p2 THEN 0
                ${bucketCases}
                WHEN ${_.field} >= p98 THEN ${buckets + 1}
            END AS bucket,
            ${_.field},
            p2,
            p98,
            actual_min,
            actual_max,
            (p98 - p2) / ${buckets} AS bin_width
        FROM \${table}
        CROSS JOIN percentiles
        WHERE ${_.field} is not null and true \${filter} \${viewport}),

    final_data AS (

    SELECT
        COUNT(*)::integer AS count,
        bucket,
        ROUND(CASE 
            WHEN bucket = 0 THEN actual_min
            WHEN bucket = ${buckets + 1} THEN p98
            ELSE p2 + (bucket - 1) * bin_width
        END::NUMERIC, ${decimals}) AS bucket_min,
        ROUND(CASE 
            WHEN bucket = 0 THEN p2
            WHEN bucket = ${buckets + 1} THEN actual_max
            ELSE p2 + bucket * bin_width
        END::NUMERIC,${decimals}) AS bucket_max
    FROM buckets
    GROUP BY bucket, p2, p98, actual_min, actual_max, bin_width
    ORDER BY bucket)`;

  // If the parameter "chartjs" is set to true, return the chart.js string
  if (_.chartjs) {
    return `
    ${sqlString}
    SELECT 
      ARRAY [JSON_BUILD_OBJECT(
        'data', ARRAY_AGG(count ORDER BY bucket))] AS datasets,
      ARRAY_AGG(bucket_min || '-' || bucket_max ORDER BY bucket) AS labels
    FROM final_data`;
  }

  return `${sqlString} SELECT * FROM final_data`;
};
