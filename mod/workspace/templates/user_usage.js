/**
### /workspace/templates/user_usage

The user_user query returns the usage information for all users in an acl table.

@module /workspace/templates/user_usage
*/
export default (_) => {
  return `
   -- Get all the data
WITH data AS (SELECT email, UNNEST(access_log) AS date
              FROM acl_schema.acl_table),

     -- get the most recent login date
     most_recent AS (SELECT MAX(date) AS most_recent, email
                     FROM data
                     GROUP BY email),

     -- get the total logins in the last 30 days
     total_logins_last_30days AS (SELECT email, COUNT(*) AS total_logins_last_30days
                                  FROM data
                                  WHERE date >= (CURRENT_DATE - INTERVAL '30 days')
                                  GROUP BY email),

     -- get the number of days with logins in the last 30 days
     days_with_login_last_30_days AS (SELECT email, COUNT(DISTINCT date) AS days_with_login_last_30_days
                                      FROM data
                                      WHERE date >= (CURRENT_DATE - INTERVAL '30 days')
                                      GROUP BY email)
SELECT most_recent.email,
       most_recent.most_recent AS most_recent_login,
       total_logins_last_30days.total_logins_last_30days,
       days_with_login_last_30_days.days_with_login_last_30_days
FROM most_recent
         LEFT JOIN total_logins_last_30days ON most_recent.email = total_logins_last_30days.email
         LEFT JOIN days_with_login_last_30_days ON most_recent.email = days_with_login_last_30_days.email`;
};
