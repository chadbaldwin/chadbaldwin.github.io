---
layout: post
title: "Why aren't old rows dropping from my temporal history table?"
description: "After running into an issue with temporal tables (system-versioned tables) and old rows hanging around, despite setting up a data retention policy...I thought I'd share my findings, turns out it's user error."
date: 2024-08-05T06:00:00-07:00
tags: T-SQL
# image: img/postbanners/no-image.png
---

Oh wait...yes they are.

Just a small disclaimer: this post is not intended to be a technical deep dive into how SQL Server handles temporal table data retention policies behind the scenes. The intent is to just tell a fun story and maybe, hopefully, help out a future internet traveler that has also run into this issue and give them a bit of relief/clarity as to what's happening.

TL;DR / Spoiler: I couldn't figure out why my temporal history table kept reporting it had old rows, despite having a data retention policy set up. Turns out it was user error. Everything was working exactly as it should.

This isn't a recipe, click here if you want to skip the story: [Stats and findings](#stats-and-findings)

----

If you're not sure what I'm talking about, read these two pages:

* [Manage retention of historical data in system-versioned temporal tables](https://learn.microsoft.com/en-us/sql/relational-databases/tables/manage-retention-of-historical-data-in-system-versioned-temporal-tables){:target="_blank"}
* [Manage historical data in Temporal tables with retention policy](https://learn.microsoft.com/en-us/azure/azure-sql/database/temporal-tables-retention-policy){:target="_blank"}

To be honest, if you just read those two pages very carefully, then this blog post is pretty much useless. Unfortunately, I apparently did _not_ read those pages very carefully, and instead was stumped by this problem for quite a while.

----

## The problem

I recently built a system for collecting index usage statistics utilizing temporal tables, clustered columnstore indexes (CCIs) and a temporal table data retention policy. The basic idea behind the system is that it collects various stats about indexes and updates this stats table. However, because it's a temporal table, all changes are logged to the underlying history table.

My history table is built using a clustered columnstore index and had a data retention policy set up for the temporal table, like so:

```tsql
WITH (
    SYSTEM_VERSIONING = ON (
        HISTORY_TABLE = dbo.MyTable_History,
        DATA_CONSISTENCY_CHECK = ON,
        HISTORY_RETENTION_PERIOD = 6 MONTHS
    )
);
```

Well, the 6 month mark finally hit so I was keeping an eye on that history table to see how quickly SQL Server would delete those rows. In my mind, I was expecting it to be nearly instant, especially since SQL Server handles it at the rowgroup level with CCIs.

To my surprise...Nothing was happening...every day I would check in on this table to see where we were at, and every day there was no change and every day more and more rows were being added to the table (at a rate of about 14M rows per day). A table that was already at 2.4 billion rows.

This is the check query I was running...

```tsql
SELECT MIN(ValidTo)
    , DATEDIFF(HOUR, MIN(ValidTo), SYSUTCDATETIME()) / 24.0
FROM dbo.MyTable_History;
```

If you see this and already see the problem...I'm happy for you, because I certainly did not.

I tried to think through why nothing was being deleted. I thought maybe there's some weird issue going on here with `>` vs `>=`...For example, maybe behind the scenes something like this is happening:

```tsql
DECLARE @today    date = '2024-08-02',
        @datadate date = '2024-02-01'
SELECT 1
WHERE DATEDIFF(MONTH, @datadate, @today) > 6
```

Which basically means it's a month behind, which seems like a pretty weird decision/bug for SQL Server to have. It's more likely that I'm wrong than for me to have run into a SQL Server bug this obvious. That said, I was still concerned, so I changed the retention policy on the table to `180 DAYS` instead of `6 MONTHS`, hoping that if this is due to some sort of `DATEDIFF` weirdness that would fix it.

I should also note that [the documentation clearly states they use `DATEADD`](https://learn.microsoft.com/en-us/sql/relational-databases/tables/manage-retention-of-historical-data-in-system-versioned-temporal-tables?view=sql-server-ver16#use-temporal-history-retention-policy-approach){:target="_blank"}, and you can even see this in the execution plan when querying a temporal table using the temporal table syntax. But I wanted to test the theory anyway.

Nothing changed.

A few weeks had gone by because I was distracted with more important work. I ran my check query and it was _still_ showing old data existed that was 206 days old.

Fortunately, querying-wise all is good because [SQL Server will automatically apply a date filter](https://learn.microsoft.com/en-us/azure/azure-sql/database/temporal-tables-retention-policy?view=azuresql#querying-tables-with-retention-policy){:target="_blank"} based on the retention policy so that even if data is still hanging around in the history table, it won't be included in query results. However, that doesn't solve my data storage issue.

----

## Aha moment

It turns out...I should try squinting harder when I read, or maybe it's time to admit I need glasses.

> [...] aged rows can be deleted by the cleanup task, _at any point in time and in arbitrary order_.

Source: [Querying tables with retention policy](https://learn.microsoft.com/en-us/azure/azure-sql/database/temporal-tables-retention-policy?view=azuresql#querying-tables-with-retention-policy){:target="_blank"}

Which means, this whole time I've been looking at the wrong thing. I've been checking for the oldest row, but not _how many_ old rows had been removed.

So I started using this check query instead, which shows by day how many rows are ready to be pruned.

```tsql
DECLARE @dt datetime2 = SYSUTCDATETIME();
DECLARE @exp datetime2 = DATEADD(DAY, -180, @dt);

SELECT ValidToDate  = CONVERT(date, ValidTo)
    , [RowCount]    = FORMAT(COUNT(*),'N0') 
    , IsExpired     = IIF(CONVERT(date, ValidTo) < @exp, 1, 0)
    , DaysOld       = DATEDIFF(DAY, CONVERT(date, ValidTo), @dt)
    , RowCountRT    = FORMAT(SUM(COUNT_BIG(*)) OVER (ORDER BY CONVERT(date, ValidTo)), 'N0')
FROM dbo.MyTable_History
WHERE ValidTo < DATEADD(DAY, 5, @exp) -- Just so we can see some non-pruned days
GROUP BY CONVERT(date, ValidTo)
ORDER BY CONVERT(date, ValidTo)
```

This query, combined with the fact that the data ingest rate is fairly consistent, I could see some rows were being deleted...Here's what it looks like at the time I'm writing this:

```plaintext
| ValidToDate | RowCount    | IsExpired | DaysOld | RowCountRT    | 
|-------------|-------------|-----------|---------|---------------| 
| 2024-01-30  |    212,558  | 1         | 185     |    212,558    | 
| 2024-01-31  |    206,691  | 1         | 184     |    419,249    | 
| 2024-02-01  |    138,146  | 1         | 183     |    557,395    | 
| 2024-02-02  |    138,428  | 1         | 182     |    695,823    | 
| 2024-02-03  |    782,870  | 1         | 181     |  1,478,693    | 
| 2024-02-04  |  6,985,658  | 1         | 180     |  8,464,351    | 
| 2024-02-05  | 13,724,560  | 0         | 179     | 22,188,911    | 
| 2024-02-06  | 13,739,960  | 0         | 178     | 35,928,871    | 
| 2024-02-07  | 13,747,964  | 0         | 177     | 49,676,835    | 
| 2024-02-08  | 13,748,268  | 0         | 176     | 63,425,103    | 
```

You can see it's still showing about 5 days "behind", BUT, the daily row count is well below the typical, which means rows are being deleted, just not in perfect order. Which aligns with the documentation for data retention policies on history tables using clustered columnstore indexes.

I could have stopped here, but I wanted to get more data...for example, how quickly is it deleting data? Is it keeping up with inserts? How often does it clean up?

----

## Stats and findings

I wanted to get more info, so I built a small process to log stats to a table on a regular basis. Things like row count, columnstore rowgroup count, etc.

Table schema:

```tsql
CREATE TABLE dbo.MyTable_History_RowCount (
    InsertDate          datetime2   NOT NULL DEFAULT GETDATE(), -- yes, GETDATE, normally I'd use SYSUTCDATETIME or SYSDATETIMEOFFSET, but for a quick one off thing I'm going to drop, this was fine.
    OldRowCount         bigint      NOT NULL,
    NewRowCount         bigint      NOT NULL,
    DateThreshold       datetime2   NOT NULL,
    RG_Compressed       int         NOT NULL, -- Compressed RowGroup count
    RG_Open             int         NOT NULL, -- Open RowGroup count
    SQLServerStartTime  datetime2   NOT NULL,
);
```

Logger proc:

```tsql
CREATE OR ALTER PROCEDURE dbo.usp_LogTemporalTableCounts
AS
BEGIN;
    SET NOCOUNT ON;

    DECLARE @OldRowCount bigint, @NewRowCount bigint, @DateThreshold datetime2, @RGC_Compressed int, @RGC_Open int, @SQLServerStartTime datetime2;

    SET @DateThreshold = '2024-08-02'; -- Picked a random date to act as the split point.

    SELECT @OldRowCount        = COUNT_BIG(*) FROM dbo.MyTable_History WHERE ValidTo <= @DateThreshold;
    SELECT @NewRowCount        = COUNT_BIG(*) FROM dbo.MyTable_History WHERE ValidTo >  @DateThreshold;
    SELECT @RGC_Compressed     = COUNT(*) FROM sys.column_store_row_groups WHERE [object_id] = OBJECT_ID('dbo.MyTable_History') AND [state] = 3;
    SELECT @RGC_Open           = COUNT(*) FROM sys.column_store_row_groups WHERE [object_id] = OBJECT_ID('dbo.MyTable_History') AND [state] = 1;
    SELECT @SQLServerStartTime = sqlserver_start_time FROM sys.dm_os_sys_info;

    INSERT INTO dbo.MyTable_History_RowCount (OldRowCount, NewRowCount, DateThreshold, RG_Compressed, RG_Open, SQLServerStartTime)
    SELECT @OldRowCount, @NewRowCount, @DateThreshold, @RGC_Compressed, @RGC_Open, @SQLServerStartTime;

    -- Clear out unchanged history, but retain first and last row for each change
    DELETE x
    FROM (
        SELECT rn1 = ROW_NUMBER() OVER (PARTITION BY OldRowCount, NewRowCount ORDER BY InsertDate)
            ,  rn2 = ROW_NUMBER() OVER (PARTITION BY OldRowCount, NewRowCount ORDER BY InsertDate DESC)
        FROM dbo.MyTable_History_RowCount
    ) x
    WHERE x.rn1 <> 1 AND x.rn2 <> 1;
END;
GO
```

The basic idea here is...Grab the rowcount above and below a specific point in time. Since the table is insert only, this will tell us exactly how many rows are inserted, vs cleaned up by the retention policy cleanup job.

I ran the above proc every 5 minutes for a few days and then I ran this analysis query to see what it looked like:

```tsql
SELECT x.InsertDate, x.DateThreshold, x.SQLServerStartTime
    , OldRowCount = FORMAT(x.OldRowCount, 'N0')
    , NewRowCount = FORMAT(x.NewRowCount, 'N0')
    , x.RG_Compressed, x.RG_Open
    , N'█' [██]
    , OldRowDiff        = FORMAT(NULLIF(x.OldRowDiff       , 0), 'N0')
    , NewRowDiff        = FORMAT(NULLIF(x.NewRowDiff       , 0), 'N0')
    , RG_CompressedDiff = FORMAT(NULLIF(x.RG_CompressedDiff, 0), 'N0')
    , RG_OpenDiff       = FORMAT(NULLIF(x.RG_OpenDiff      , 0), 'N0')
    , N'█' [██]
    , RowCountChangeRT  = FORMAT(SUM(x.OldRowDiff + x.NewRowDiff) OVER (ORDER BY x.InsertDate), 'N0')
FROM (
    SELECT *
        , OldRowDiff        = OldRowCount   - LAG(OldRowCount)   OVER (ORDER BY InsertDate)
        , NewRowDiff        = NewRowCount   - LAG(NewRowCount)   OVER (ORDER BY InsertDate)
        , RG_CompressedDiff = RG_Compressed - LAG(RG_Compressed) OVER (ORDER BY InsertDate)
        , RG_OpenDiff       = RG_Open       - LAG(RG_Open)       OVER (ORDER BY InsertDate)
    FROM dbo.MyTable_History_RowCount
) x
ORDER BY InsertDate DESC;
```

The above analysis query allows you to see how many old rows were removed, new rows added, compressed and open rowgroups created/dropped, and a running total of row counts over time.

Here's a sample export:

```plaintext
| InsertDate              | DateThreshold | SQLServerStartTime      | OldRowCount   | NewRowCount | RG_Compressed | RG_Open | ██ | OldRowDiff | NewRowDiff | RG_CompressedDiff | RG_OpenDiff | ██ | RowCountChangeRT | 
|-------------------------|---------------|-------------------------|---------------|-------------|---------------|---------|----|------------|------------|-------------------|-------------|----|------------------| 
| 2024-08-03 21:15:07.516 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,340,074,012 | 28,770,672  | 2258          | 3       | █  | NULL       | NULL       | NULL              | NULL        | █  | 3,301,606        | 
| 2024-08-03 20:30:08.216 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,340,074,012 | 28,770,672  | 2258          | 3       | █  | -1,048,576 | NULL       | -1                | NULL        | █  | 3,301,606        | 
| 2024-08-03 20:25:08.130 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,341,122,588 | 28,770,672  | 2259          | 3       | █  | NULL       | NULL       | 1                 | NULL        | █  | 4,350,182        | 
| 2024-08-03 17:10:06.670 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,341,122,588 | 28,770,672  | 2258          | 3       | █  | NULL       | 543,479    | 4                 | NULL        | █  | 4,350,182        | 
| 2024-08-03 17:05:06.553 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,341,122,588 | 28,227,193  | 2254          | 3       | █  | NULL       | 3,052,855  | NULL              | -4          | █  | 3,806,703        | 
| 2024-08-03 17:00:07.810 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,341,122,588 | 25,174,338  | 2254          | 7       | █  | NULL       | NULL       | NULL              | NULL        | █  | 753,848          | 
| 2024-08-03 12:30:08.010 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,341,122,588 | 25,174,338  | 2254          | 7       | █  | -6,291,456 | NULL       | -6                | NULL        | █  | 753,848          | 
| 2024-08-03 12:25:06.376 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,347,414,044 | 25,174,338  | 2260          | 7       | █  | NULL       | NULL       | NULL              | NULL        | █  | 7,045,304        | 
| 2024-08-03 11:10:06.360 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,347,414,044 | 25,174,338  | 2260          | 7       | █  | NULL       | 574,644    | 1                 | NULL        | █  | 7,045,304        | 
| 2024-08-03 11:05:06.320 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,347,414,044 | 24,599,694  | 2259          | 7       | █  | NULL       | 3,021,690  | 1                 | 2           | █  | 6,470,660        | 
| 2024-08-03 11:00:08.080 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,347,414,044 | 21,578,004  | 2258          | 5       | █  | NULL       | NULL       | 2                 | NULL        | █  | 3,448,970        | 
| 2024-08-03 05:10:07.336 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,347,414,044 | 21,578,004  | 2256          | 5       | █  | NULL       | 1,984,706  | 1                 | 2           | █  | 3,448,970        | 
| 2024-08-03 05:05:09.593 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,347,414,044 | 19,593,298  | 2255          | 3       | █  | NULL       | 1,611,628  | 2                 | -2          | █  | 1,464,264        | 
| 2024-08-03 05:00:08.253 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,347,414,044 | 17,981,670  | 2253          | 5       | █  | NULL       | NULL       | NULL              | NULL        | █  | -147,364         | 
| 2024-08-03 04:30:10.010 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,347,414,044 | 17,981,670  | 2253          | 5       | █  | -4,194,304 | NULL       | -4                | NULL        | █  | -147,364         | 
| 2024-08-03 04:25:06.500 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,351,608,348 | 17,981,670  | 2257          | 5       | █  | NULL       | NULL       | 1                 | NULL        | █  | 4,046,940        | 
| 2024-08-02 23:10:06.266 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,351,608,348 | 17,981,670  | 2256          | 5       | █  | NULL       | 676,028    | 1                 | -1          | █  | 4,046,940        | 
| 2024-08-02 23:05:07.350 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,351,608,348 | 17,305,642  | 2255          | 6       | █  | NULL       | 2,920,306  | 1                 | -1          | █  | 3,370,912        | 
| 2024-08-02 23:00:09.950 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,351,608,348 | 14,385,336  | 2254          | 7       | █  | NULL       | NULL       | NULL              | NULL        | █  | 450,606          | 
| 2024-08-02 20:30:12.170 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,351,608,348 | 14,385,336  | 2254          | 7       | █  | -3,145,728 | NULL       | -3                | NULL        | █  | 450,606          | 
| 2024-08-02 20:25:07.330 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,354,754,076 | 14,385,336  | 2257          | 7       | █  | NULL       | NULL       | NULL              | NULL        | █  | 3,596,334        | 
| 2024-08-02 17:10:05.263 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,354,754,076 | 14,385,336  | 2257          | 7       | █  | NULL       | 870,749    | 3                 | -1          | █  | 3,596,334        | 
| 2024-08-02 17:05:05.943 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,354,754,076 | 13,514,587  | 2254          | 8       | █  | NULL       | 2,725,585  | 1                 | 4           | █  | 2,725,585        | 
| 2024-08-02 17:00:06.480 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,354,754,076 | 10,789,002  | 2253          | 4       | █  | NULL       | NULL       | NULL              | NULL        | █  | 0                | 
| 2024-08-02 16:45:08.340 | 2024-08-02    | 2024-07-26 04:21:16.230 | 2,354,754,076 | 10,789,002  | 2253          | 4       | █  | NULL       | NULL       | NULL              | NULL        | █  | NULL             | 
```

From what I can see, the cleanup process is keeping up perfectly fine over time. The rate at which rows are deleted (technically rowgroups) is keeping up with the rate at which rows are added.

The background job runs every 8 hours based on when SQL Server was started. For example, I noticed when the instance is restarted at around 4:30am, the background cleanup job runs at around 12:30pm, 8:30pm, 4:30am.

The total number of rowgroups dropped seems to be inconsistent, but this is likely due to how the rowgroups are filled at the time the data is inserted. All that matters to me is that it's working and it's keeping up.

My _assumption_ is that because multiple rowgroups are kept open at a time, some of those could be open for days. As new data is inserted, it's distributed into those rowgroups. So if there's 5 open rowgroups, and it takes about 5 days for them to fill up and compress...then it would make sense that the oldest data in the history table is typically around 5 days.

As far as why the table was backed up by 26 days when this whole thing started? My guess is that was a remnant of development. When I first started building the process, I was only inserting a few thousand rows at a time, instead of a few million like I do now. Which means there was likely more open rowgroups for the data to be distributed into. When the cleanup routine tried to run...it couldn't find any rowgroups containing ONLY expired rows. _Then_ at some point, my process started inserting millions of rows per day, which triggers the rowgroups to get compressed much quicker, closing that window.

----

## Next blog post

Will be a sort of extension on this one...

I searched and searched around online hoping I could find some system view or undocumented function that would let me inspect the contents of an individual columnstore segment, similar to using `DBCC PAGE` to view the contents of an individual page, but unfortunately I couldn't find anything. I _was_ able to inspect individual columnstore index pages, but inspecting a single page doesn't really help me unless I know which segment it's coming from and I was having trouble figuring out that relationship.

I thought it would be cool if I could inspect the actual contents of the columnstore rowgroup and see why _that_ particular rowgroup hasn't been dropped.

Well...after about 5 hours of pulling my hair out...I discovered that `sys.column_store_segments` contains a `min_data_id` and a `max_data_id` value, but for columns of type `datetime2` it's just the raw value, rather than a pointer to some dictionary value or something...

So my next blog post will be about how I figured that out and my solution for it. I didn't want this post to be even longer than it already is 😂
