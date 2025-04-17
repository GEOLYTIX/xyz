/**
### /workspace/templates/histogram

The query returns data organised in a specified number of buckets in order to visualise histogram for continuous data.
`buckets` is an optional integer parameter which defines number of groups.
If unset buckets parameters defaults to 7.

@module /workspace/templates/histogram

*/
export default (_) => {
  _.buckets ??= 7;

  return `
    with percentiles as (
        select 
        percentile_cont(0.98) within group(order by ${_.field}) p98,
        percentile_cont(0.02) within group(order by ${_.field}) p2
        from ${_.table}
    ),
    buckets as (
        select 
        case 
        when ${_.field} <=p2 then 0
        ${[...Array(_.buckets).keys()]
          .map((bucket) => {
            return `when ${_.field} < p2 + ${bucket + 1}*(p98-p2)/${_.buckets} then ${bucket + 1}`;
          })
          .join('\n')}
        when ${_.field} >= p98 then ${_.buckets + 1} 
        end as bucket
        from ${_.table} 
        cross join percentiles
    )
    select 
    count(*) as count, 
    bucket
    from buckets
    group by bucket
    order by bucket
    `;
};
