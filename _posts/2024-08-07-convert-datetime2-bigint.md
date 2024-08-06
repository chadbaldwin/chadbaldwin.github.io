---
layout: post
title: "Decoding datetime2 columnstore segment range values"
description: "Ever queried sys.column_store_segments and wondered how to decode max_data_id and min_data_id for datetime2 values? No? Well, I'm going to show you anyway"
date: 2024-08-07T07:00:00-07:00
tags: T-SQL
image: img/postbanners/2024-08-07-convert-datetime2-bigint.png
---

Disclaimer: I am by no means an expert on columnstore indexes. This was just a fun distraction I ran into and felt like talking about it. I'm always open to constructive criticism on these posts.

----

This is an extension on my previous blog post where I dealt with an issue involving temporal tables utilizing a clustered columnstore index and a data retention policy. I noticed that old rows were still in my history table, even though the data retention cleanup process had just run.

My guess is because SQL Server keeps multiple rowgroups open at a time while distributing new data into them before compressing the rowgroups. There's likely a small overlap between rowgroups from day to day. So one rowgroup may contain 5 days worth of data, even though my process inserts 14M rows per day. This means the cleanup job may appear to be behind when it's not.

As part of looking into this issue, I started skimming through the columnstore index system DMVs to see what information I could glean.

I noticed in `sys.column_store_segments` the `min_data_id` and `max_data_id` columns store very large bigint values in the segments for `datetime2` columns. After doing a bit more googling and tinkering, I found for `bit`/`tinyint`/`smallint`/`int`/`bigint` it stores the min/max of the _actual_ values rather than dictionary lookup values. So I assume it's likely doing the same for `date`/`time`/`datetime`/`datetime2` and storing some sort of bigint representation of the actual value.

This post is going to focus on `datetime2(7)` datatypes mainly because that's what I was dealing with. Though I'm sure it wouldn't be much work to figure out the other types.

I should also note...there may be existing blog posts covering this, I couldn't find any. There's also a very good chance this is covered in one of Niko Neugebauer's many columnstore index blogs. But in the end, I really wanted to see if I could figure this out on my own because I was having fun with it.

----

## The problem

I have a temporal table that contains a few billion rows and I have a data retention policy of 180 days. The period end column in my table is named `ValidTo` and the history table uses a clustered columnstore index, which means the data cleanup job works by dropping whole rowgroups.

Here's what `sys.column_store_segments` looks like for that column:

```tsql
SELECT ColumnName = c.[name]
   , TypeName = TYPE_NAME(c.system_type_id), c.scale
   , s.segment_id, s.min_data_id, s.max_data_id
FROM sys.column_store_segments s
    JOIN sys.partitions p ON p.[partition_id] = s.[partition_id]
    JOIN sys.columns c ON c.[object_id] = p.[object_id] AND c.column_id = s.column_id
WHERE p.[object_id] = OBJECT_ID('dbo.MyTable_History')
    AND c.[name] = 'ValidTo'
ORDER BY s.segment_id;
```

```plaintext
| ColumnName | TypeName  | scale | segment_id | min_data_id        | max_data_id        | 
|------------|-----------|-------|------------|--------------------|--------------------| 
| ValidTo    | datetime2 | 7     | 901        | 812451496414559815 | 812453025851490574 | 
| ValidTo    | datetime2 | 7     | 902        | 812453024026222779 | 812453025718816479 | 
| ValidTo    | datetime2 | 7     | 907        | 812449298004095678 | 812453476378687270 | 
| ValidTo    | datetime2 | 7     | 908        | 812452596987479114 | 812453476127092027 | 
| ValidTo    | datetime2 | 7     | 909        | 812453025927907048 | 812453475318555080 | 
| ValidTo    | datetime2 | 7     | 910        | 812453476389782465 | 812453477968585804 | 
| ValidTo    | datetime2 | 7     | 911        | 812453476378999816 | 812453692263928518 | 
```

So the question is...what the heck do those values represent for a `datetime2` column?

First things first, let's get this out of the way...this doesn't work:

```tsql
DECLARE @bigint_value bigint = 812453476378999816;
SELECT CONVERT(datetime2, CONVERT(binary(8), @bigint_value))

'
Msg 241, Level 16, State 1, Line 155
Conversion failed when converting date and/or time from character string.
'
```

So much for the easy route.

----

## Maybe it's number of ticks?

I should mention...At this point, I had no idea how SQL Server stored `datetime2` values internally. Had I known, that probably would have saved me a lot of time.

My first thought was that this might be something like Unix timestamps where it's the number of seconds/milliseconds/whatever since 1970-01-01 UTC. So that's where I went first. I spent a good amount of time trying to take `812449298004095678` (the min `min_data_id`) and convert it into a date that I assumed was `2024-02-03 10:08:23.1109310` (the `MIN(ValidTo)` in the actual table).

I tried all sorts of things and came up with nothing...For example, trying to convert `812449298004095678` to the number of ticks (0.0000001 second or 100 nanoseconds) since `0001-01-01 00:00:00.000`, which kept producing values that were WAY too high. You can test this out in PowerShell:

```powershell
([datetime]'0001-01-01').AddTicks(812449298004095678)
# Returns: Thursday, July 20, 2575 8:03:20 PM
```

----

## Let's create some more reliable data

After that failed attempt, I thought maybe I could create a new table with a clustered columnstore index and populate the columns with only a single value. This way each column segment would only represent a single known value, giving me a sort of mapping between known values and their converted value that we're trying to decode.

The new table schema:

```tsql
DROP TABLE IF EXISTS dbo.TestCCI;
CREATE TABLE dbo.TestCCI (
    dt0001      datetime2 NOT NULL, -- datetime2 min
    dt0001_1tk  datetime2 NOT NULL, -- min + 1 tick (100ns)
    dt0001_1us  datetime2 NOT NULL, -- min + 1 microsecond
    dt0001_1ms  datetime2 NOT NULL, -- min + 1 millisecond
    dt0001_1sec datetime2 NOT NULL, -- min + 1 second
    dt0001_1hr  datetime2 NOT NULL, -- min + 1 hour
    dt0001_12hr datetime2 NOT NULL, -- min + 12 hour
    dt0001_1d   datetime2 NOT NULL, -- min + 1 day
    dt0001_2d   datetime2 NOT NULL, -- min + 2 day
    dt1753      datetime2 NOT NULL, -- hardcoded date - 1753-01-01
    dt1900      datetime2 NOT NULL, -- hardcoded date - 1900-01-01
    dtMAX       datetime2 NOT NULL, -- datetime2 max

    INDEX CCI_TestCCI CLUSTERED COLUMNSTORE,
);
```

Populate data script. This script ensures that at least a couple compressed rowgroups are created by inserting at least 1,048,576 * 2 rows.

```tsql
DECLARE @dt datetime2(7) = '0001-01-01';

WITH c1 AS (SELECT x.x FROM (VALUES(1),(1),(1),(1),(1),(1),(1),(1),(1),(1),(1),(1)) x(x))   -- 12
    , c2(x) AS (SELECT 1 FROM c1 x CROSS JOIN c1 y)                                         -- 12 * 12
    , c3(x) AS (SELECT 1 FROM c2 x CROSS JOIN c2 y CROSS JOIN c2 z)                         -- 144 * 144 * 144
INSERT INTO dbo.TestCCI (
    dt0001, dt0001_1tk, dt0001_1us, dt0001_1ms, dt0001_1sec, dt0001_1hr, dt0001_12hr,
    dt0001_1d, dt0001_2d, dt1753, dt1900, dtMAX
)
SELECT @dt
    , DATEADD(NANOSECOND, 100, @dt) -- 1 tick = 100 nanoseconds
    , DATEADD(MICROSECOND, 1, @dt)
    , DATEADD(MILLISECOND, 1, @dt)
    , DATEADD(SECOND, 1, @dt), DATEADD(HOUR, 1, @dt), DATEADD(HOUR, 12, @dt)
    , DATEADD(DAY, 1, @dt), DATEADD(DAY, 2, @dt)
    , '1753-01-01', '1900-01-01', '9999-12-31 23:59:59.9999999'
FROM c3;
```

Here's what that data looks like in `sys.column_store_segments`

```tsql
SELECT ColumnName = c.[name], MinValue = MIN(s.min_data_id)
FROM sys.column_store_segments s
    JOIN sys.partitions p ON p.[partition_id] = s.[partition_id]
    JOIN sys.columns c ON c.[object_id] = p.[object_id] AND c.column_id = s.column_id
WHERE p.[object_id] = OBJECT_ID('dbo.TestCCI')
GROUP BY c.column_id, c.[name]
ORDER BY c.column_id;
```

```plaintext
| ColumnName  | MinValue            | 
|-------------|---------------------| 
| dt0001      | 0                   | 
| dt0001_1tk  | 1                   | 
| dt0001_1us  | 10                  | 
| dt0001_1ms  | 10000               | 
| dt0001_1sec | 10000000            | 
| dt0001_1hr  | 36000000000         | 
| dt0001_12hr | 432000000000        | 
| dt0001_1d   | 1099511627776       | 
| dt0001_2d   | 2199023255552       | 
| dt1753      | 703582988172001280  | 
| dt1900      | 762615767467294720  | 
| dtMAX       | 4015481100312363007 | 
```

Now we're picking up on a pattern. It seems like my original guess was right to some extent. It is a representation of the number of ticks...Until you roll over to the next day. That part was confusing me because it's pretty obvious that `36000000000` (1 hour) * 24 is not equal to `1099511627776` (1 day).

The next step was to start examining this in `binary` to see if there is any pattern there. Since we know all of these values represent a `datetime2(7)` value, then we know its 8 bytes. So lets convert it all to their `binary` and `datetime2` representations.

```plaintext
| datetime2 value             | binary - date component    | binary - time component                      |
| ----------------------------|----------------------------|----------------------------------------------|
| 0001-01-01 00:00:00.0000000 | 00000000 00000000 00000000 | 00000000 00000000 00000000 00000000 00000000 |
| 0001-01-01 00:00:00.0000001 | 00000000 00000000 00000000 | 00000000 00000000 00000000 00000000 00000001 |
| 0001-01-01 00:00:00.0000010 | 00000000 00000000 00000000 | 00000000 00000000 00000000 00000000 00001010 |
| 0001-01-01 00:00:00.0010000 | 00000000 00000000 00000000 | 00000000 00000000 00000000 00100111 00010000 |
| 0001-01-01 00:00:01.0000000 | 00000000 00000000 00000000 | 00000000 00000000 10011000 10010110 10000000 |
| 0001-01-01 01:00:00.0000000 | 00000000 00000000 00000000 | 00001000 01100001 11000100 01101000 00000000 |
| 0001-01-01 12:00:00.0000000 | 00000000 00000000 00000000 | 01100100 10010101 00110100 11100000 00000000 |
| 0001-01-02 00:00:00.0000000 | 00000000 00000000 00000001 | 00000000 00000000 00000000 00000000 00000000 |
| 0001-01-03 00:00:00.0000000 | 00000000 00000000 00000010 | 00000000 00000000 00000000 00000000 00000000 |
| 1753-01-01 00:00:00.0000000 | 00001001 11000011 10100001 | 00000000 00000000 00000000 00000000 00000000 |
| 1900-01-01 00:00:00.0000000 | 00001010 10010101 01011011 | 00000000 00000000 00000000 00000000 00000000 |
| 9999-12-31 23:59:59.9999999 | 00110111 10111001 11011010 | 11001001 00101010 01101001 10111111 11111111 |
```

Once I converted the data to this view...I immediately recognized the pattern and I already show it above. It appears the date component is stored in the first 3 bytes as the number of days since `0001-01-01` and the time component uses the last 5 bytes as the number of ticks since `00:00:00.0000000`.

Some of you might know this already...but this is _very_ similar to how SQL Server stores `datetime2` values internally. Unfortunately, I did not know that and I had to learn that the long way.

----

## How do we convert it back to datetime2?

Well we already know we can't directly convert it.

My first thought was maybe I can grab the first 3 bytes, and `DATEADD(day, {value}, '0001-01-01')`, then do the same for the last 5 bytes...The problem is, 5 bytes goes beyond the limits of what `DATEADD` can handle, which is limited to int (4 bytes). Unfortunately, there is no `DATEADD_BIG()` function like there is a `DATEDIFF_BIG()`.

I _could_ handle this with some sort of binary math, or while loop to break that larger number up. But instead, I wanted to focus on how to build a binary representation of a `datetime2` value that can be directly converted

The problem is, I had no idea how `datetime2` is actually stored in binary, but there's an easy way to find out.

```tsql
DECLARE @dt2now datetime2 = SYSUTCDATETIME();
SELECT CONVERT(binary(8), @dt2now);

'
Msg 8152, Level 16, State 17, Line 158
String or binary data would be truncated.
'
```

Uhhh....wat? Why would a value that is 8 bytes be truncated when converted to an 8 byte binary?

I'll save you the headache this gave me...Read this blog post that I eventually found:

<https://bornsql.ca/blog/datetime2-8-bytes-binary-9-bytes/>

TL;DR - When converting a `datetime2` value to a `binary` datatype, SQL Server doesn't want to lose precision, so it includes the precision with the converted value. Including the precision adds an extra byte to the value, so we need to use `binary(9)` instead. This also means we need to make sure our conversion logic handles this.

Let's try that again...

```tsql
/* The value '0001-01-01 15:16:15.5813889' will create a binary value with all 0's
   for the date component and the time component will start and end with a 1.
   This will make it easy to identify which bits represent the date and which
   represent the time in the converted output so that we can compare it with the
   binary of the values we're getting from sys.column_store_segments.
*/
DECLARE @dt2now datetime2 = '0001-01-01 15:16:15.5813889';
SELECT CONVERT(binary(9), @dt2now);

-- RETURNS: 0x070100000080000000
```

This breaks down like so:

```plaintext
      Precision  Time          Date
0x    0x07       0100000080    000000
```

Well that's weird...because if we use that same timestamp but create a binary value using the method used in the `bigint` value, we get this...

```plaintext
      Date       Time
0x    000000     8000000001 (which is 549755813889 as a bigint)
```

It took me a second to realize what happened after mentally going back to my old college assembly classes...The first one is stored in little-endian, whereas our bigint is storing it in big-endian...I won't go into detail explaining what that is or how it works, but the basic idea is that the binary data is stored in a different "direction", luckily that's a pretty simple fix.

----

## The solution

We're finally here...We now have all the information we need to convert the original `bigint` values back to their original `datetime2` form. We know that we need to convert our big-endian value to little-endian while also adding the missing precision information back in.

One fun thing to keep in mind here is that whether it's a number, string data, date/time, etc, it's all stored in bytes and those bytes can be converted into strings (nvarchar) and treated as such, including things like concatenation. Since I'm working on a SQL Server 2017 instance, I don't have access to the newer left/right shift binary functions. So I'm going to work around it by using concatenation to handle bit shifting.

```tsql
DECLARE @src_bigint_value    bigint,
        @src_binary_value    binary(8),
        @precision           binary(1) = 0x07,
        @output_binary       binary(9);

SET @src_bigint_value = 549755813889; -- '0001-01-01 15:16:15.5813889'

-- First we'll convert it to an 8-byte binary
SET @src_binary_value = CONVERT(binary(8), @src_bigint_value)
-- Then We concat the precision value (+ acts as a binary left shift)
SET @output_binary = @src_binary_value + @precision
/* That gets us: 0x000000800000000107 */

-- Now let's handle the little-endian conversion to big-endian
-- We'll do this by cheating a bit and treating it like a string
SET @output_binary = CONVERT(binary(9), REVERSE(@output_binary))
/* That gets us: 0x070100000080000000 */

-- All we need to do now is convert it to datetime2...
SELECT CONVERT(datetime2, @output_binary)
-- RETURNS: 0001-01-01 15:16:15.5813889
```

SUCCESS!!! 🥳

And that's it! We now have a formula we can reduce down into a one liner and use it to decode the values stored in `sys.column_store_segments` for `datetime2` values.

## The final test

I put together the following query to run against `sys.column_store_segments`. It looks only at segments for our table `dbo.MyTable_History` and the `ValidTo` column, which is a `datetime2`. This is the column which helps tell SQL Server which rowgroups are safe to drop based on the data retention policy settings.

```tsql
DECLARE @dt2_precision binary(1) = 0x07;

SELECT n.SchemaName, n.ObjectName, n.ColumnName, s.segment_id
    , s.min_data_id, s.max_data_id
    , x.min_data_val, x.max_data_val, y.min_data_val_age, y.max_data_val_age
FROM sys.column_store_segments s
    JOIN sys.partitions p ON p.[partition_id] = s.[partition_id]
    JOIN sys.columns c ON c.[object_id] = p.[object_id] AND c.column_id = s.column_id
    CROSS APPLY (SELECT SchemaName = OBJECT_SCHEMA_NAME(p.[object_id]), ObjectName = OBJECT_NAME(p.[object_id]), ColumnName = c.[name]) n
    CROSS APPLY ( -- Convert bigint values to datetime2
        SELECT min_data_val = CONVERT(datetime2, CONVERT(binary(9), REVERSE(CONVERT(binary(8), s.min_data_id) + @dt2_precision)))
            ,  max_data_val = CONVERT(datetime2, CONVERT(binary(9), REVERSE(CONVERT(binary(8), s.max_data_id) + @dt2_precision)))
    ) x
    CROSS APPLY ( -- Calculate age of datetime2 values
        SELECT min_data_val_age = DATEDIFF(SECOND, x.min_data_val, SYSUTCDATETIME()) / 86400.0
            ,  max_data_val_age = DATEDIFF(SECOND, x.max_data_val, SYSUTCDATETIME()) / 86400.0
    ) y
WHERE 1=1
    AND p.[object_id] = OBJECT_ID('dbo.MyTable_History')  -- table with columnstore index
    AND p.index_id = 1                                    -- clustered columnstore index
    AND c.[name] = 'ValidTo'                              -- target column
    AND c.system_type_id = TYPE_ID('datetime2')
ORDER BY n.SchemaName, n.ObjectName, n.ColumnName, s.segment_id
```

The result of the query looks like this (minus a few columns since I'm running it for 1 table)

```plaintext
| segment_id | min_data_id        | max_data_id        | min_data_val                | max_data_val                | min_data_val_age | max_data_val_age | 
|------------|--------------------|--------------------|-----------------------------|-----------------------------|------------------|------------------| 
| 907        | 812449298004095678 | 812453476378687270 | 2024-02-03 10:08:23.1109310 | 2024-02-07 04:02:15.9189798 | 183.7130092      | 179.9672685      | 
| 908        | 812452596987479114 | 812453476127092027 | 2024-02-06 10:09:07.9609418 | 2024-02-07 04:01:50.7594555 | 180.7125000      | 179.9675578      | 
| 909        | 812453025927907048 | 812453475318555080 | 2024-02-06 22:04:02.0037352 | 2024-02-07 04:00:29.9057608 | 180.2160300      | 179.9684953      | 
| 910        | 812453476389782465 | 812453477968585804 | 2024-02-07 04:02:17.0284993 | 2024-02-07 04:04:54.9088332 | 179.9672453      | 179.9654282      | 
| 911        | 812453476378999816 | 812453692263928518 | 2024-02-07 04:02:15.9502344 | 2024-02-07 10:02:04.4431046 | 179.9672685      | 179.7173958      | 
| 912        | 812453476378687270 | 812453694459519806 | 2024-02-07 04:02:15.9189798 | 2024-02-07 10:05:44.0022334 | 179.9672685      | 179.7148495      | 
| 913        | 812453025926031789 | 812453695400109701 | 2024-02-06 22:04:01.8162093 | 2024-02-07 10:07:18.0612229 | 180.2160416      | 179.7137615      | 
| 914        | 812452592568429350 | 812453696032378631 | 2024-02-06 10:01:46.0559654 | 2024-02-07 10:08:21.2881159 | 180.7176041      | 179.7130324      | 
| 918        | 812453023938866652 | 812453696236467422 | 2024-02-06 22:00:43.0996956 | 2024-02-07 10:08:41.6969950 | 180.2183333      | 179.7128009      | 
| 919        | 812453476297895476 | 812453695679676954 | 2024-02-07 04:02:07.8398004 | 2024-02-07 10:07:46.0179482 | 179.9673611      | 179.7134375      | 
```

The data retention policy for this table is set to 180 days, which means rowgroups containing only data where `ValidTo >= 180 days ago` is safe to drop. Looking at the output of the query above, we can see why SQL Server did not drop some of these rowgroups...all of them have a max ValidTo of ~179 days old, which is not >= 180. Ths is allowing data older than 180 days to live in the table.
