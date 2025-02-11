module.exports = `
    SELECT count(*) as location_count
    FROM \${table}
    WHERE true \${filter} \${viewport}`;
