---
layout: post
title: Only update rows that changed? Try using EXISTS and EXCEPT
description: Don't waste your time building giant statements checking for NULL, just use EXISTS and EXCEPT
date: 2020-12-30 11:12:30 -0800
tags: T-SQL
---

This is one of my favorite SQL tricks.

Maybe you're building an ETL process, like loading a file, or need to compare two tables? How would you write that update?

One of the daunting parts of writing updates, especially with a large number of columns, is figuring out which records actually changed, and only updating those records.

Of course, there's always more than one way to bake a cake.

----

One method is to compare each column in the `WHERE` clause separating each comparison with an `OR`...

```tsql
UPDATE c
    SET c.FirstName   = u.FirstName,
        c.LastName    = u.LastName,
        c.MiddleName  = u.MiddleName,
        c.DateOfBirth = u.DateOfBirth
FROM #Customer c
    JOIN #Updates u ON u.CustomerID = c.CustomerID
WHERE c.FirstName    <> u.FirstName
    OR c.LastName    <> u.LastName
    OR c.MiddleName  <> u.MiddleName
    OR c.DateOfBirth <> u.DateOfBirth;
```

This works fine, as long as every column isn't nullable. But what if `MiddleName` and `DateOfBirth` allows NULLs?

You could do something like this...

```tsql
UPDATE c
    SET c.FirstName   = u.FirstName,
        c.LastName    = u.LastName,
        c.MiddleName  = u.MiddleName,
        c.DateOfBirth = u.DateOfBirth
FROM #Customer c
    JOIN #Updates u ON u.CustomerID = c.CustomerID
WHERE c.FirstName <> u.FirstName
    OR c.LastName <> u.LastName
    OR CASE WHEN c.MiddleName = u.MiddleName                     THEN 0
            WHEN c.MiddleName  IS NULL AND u.MiddleName  IS NULL THEN 0
            ELSE 1 END = 1
    OR CASE WHEN c.DateOfBirth = u.DateOfBirth                   THEN 0
            WHEN c.DateOfBirth IS NULL AND u.DateOfBirth IS NULL THEN 0
            ELSE 1 END = 1;
```

This works...but it is hard to read, and now you need to keep track of which columns are nullable and which ones aren't. What happens when `LastName` is changed to allow `NULL`? The update is no longer correct, and needs to be fixed.

This is where my favorite trick comes in; Using the `EXISTS` operator and the `EXCEPT` set operator to identify changed rows.

----

## The Basics - How EXCEPT works

The `EXCEPT` set operator compares two sets of records, and returns all of the records from the first set that don't have a matching record in the second set.

The most basic examples would be:

```tsql
-- Returns nothing
SELECT 1, NULL
EXCEPT
SELECT 1, NULL;

-- Returns NULL
SELECT NULL
EXCEPT
SELECT 1;

-- Returns 1
SELECT 1
EXCEPT
SELECT NULL;
```

The first example returns nothing because the two sets match, but the following two examples return records from the first set because it was unable to find any matching records in the second set.

The other thing to note is that the `EXCEPT` operator treats the comparison of `NULL` values as equal. Unlike standard comparison operators. It's this difference that helps us use it to find changed rows.

----

## Let's set up some sample data

```tsql
IF OBJECT_ID('tempdb..#Customer','U') IS NOT NULL DROP TABLE #Customer; --SELECT * FROM #Customer
CREATE TABLE #Customer (
    CustomerID  int         NOT NULL PRIMARY KEY,
    FirstName   varchar(50) NOT NULL,
    MiddleName  varchar(50)     NULL,
    LastName    varchar(50) NOT NULL,
    DateOfBirth date            NULL,
);

INSERT INTO #Customer (CustomerID, FirstName, MiddleName, LastName, DateOfBirth)
VALUES ( 1, 'Sheldon'   , 'Dennis'  ,'Saunders'     , '2019-12-10')
    ,  ( 2, 'Barry'     , NULL      ,'Richardson'   , '1990-09-29')
    ,  ( 3, 'Rosa'      , 'Evelyn'  ,'Rodriquez'    , '1974-09-11')
    ,  ( 4, 'Dwayne'    , NULL      ,'Neal'         , '1997-01-26')
    ,  ( 5, 'Jane'      , NULL      ,'Green'        , '1977-01-13')
    ,  ( 6, 'Margaret'  , NULL      ,'Rodriguez'    , '1991-06-08')
    ,  ( 7, 'Chris'     , 'Stephen' ,'King'         , '1982-11-15')
    ,  ( 8, 'Joe'       , NULL      ,'Smith'        , '1972-09-18')
    ,  ( 9, 'Paul'      , NULL      ,'Ramirez'      , '1971-02-20')
    ,  (10, 'Amanda'    , 'Beverly' ,'White'        , '2013-04-28');
```

Here we've got some sample data...We have a customer table, where we store the customers first, middle and last name, and their birth date. Note that `MiddleName` and `DateOfBirth` allow `NULL`.

Now lets create a new table where we can make modifications to the data for us to sync back to the original `#Customer` table:

```tsql
IF OBJECT_ID('tempdb..#Updates','U') IS NOT NULL DROP TABLE #Updates; --SELECT * FROM #Updates
SELECT c.CustomerID, c.FirstName, c.MiddleName, c.LastName, c.DateOfBirth
INTO #Updates
FROM #Customer c;

UPDATE #Updates SET LastName    = 'Brown'      WHERE CustomerID = 5; -- Change Last Name
UPDATE #Updates SET MiddleName  = 'John'       WHERE CustomerID = 9; -- Add Middle Name
UPDATE #Updates SET MiddleName  = NULL         WHERE CustomerID = 3; -- Remove Middle Name
UPDATE #Updates SET DateOfBirth = '1990-09-22' WHERE CustomerID = 2; -- Change DateOfBirth

-- Add new Customer
INSERT INTO #Updates (CustomerID, FirstName, MiddleName, LastName, DateOfBirth)
VALUES (11, 'Chad', NULL, 'Baldwin', '1990-01-12');
```

Now we have a copy of the `#Customer` table named `#Updates`, and we've made a few changes to the data.

----

Let's use `EXISTS` and `EXCEPT` to find all records which changed...

```tsql
SELECT *
FROM #Customer c
    JOIN #Updates u ON u.CustomerID = c.CustomerID
WHERE EXISTS (
    SELECT c.FirstName, c.MiddleName, c.LastName, c.DateOfBirth
    EXCEPT
    SELECT u.FirstName, u.MiddleName, u.LastName, u.DateOfBirth
);
```

Cool right? This is giving you all records in `#Customer` which do not have a matching record in `#Updates`.

To go from that to an update or a merge statement, is fairly simple...

### Update

```tsql
UPDATE c
    SET c.FirstName   = u.FirstName,
        c.MiddleName  = u.MiddleName,
        c.LastName    = u.LastName,
        c.DateOfBirth = u.DateOfBirth
FROM #Customer c
    JOIN #Updates u ON u.CustomerID = c.CustomerID
WHERE EXISTS (
    SELECT c.FirstName, c.MiddleName, c.LastName, c.DateOfBirth
    EXCEPT
    SELECT u.FirstName, u.MiddleName, u.LastName, u.DateOfBirth
);
```

### Merge

```tsql
MERGE INTO #Customer c
USING #Updates u ON u.CustomerID = c.CustomerID
WHEN MATCHED AND EXISTS (
                    SELECT c.FirstName, c.MiddleName, c.LastName, c.DateOfBirth
                    EXCEPT
                    SELECT u.FirstName, u.MiddleName, u.LastName, u.DateOfBirth
                )
THEN
    UPDATE SET c.FirstName    = u.FirstName,
                c.MiddleName  = u.MiddleName,
                c.LastName    = u.LastName,
                c.DateOfBirth = u.DateOfBirth
WHEN NOT MATCHED BY TARGET
THEN
    INSERT (CustomerID, FirstName, MiddleName, LastName, DateOfBirth)
    VALUES (u.CustomerID, u.FirstName, u.MiddleName, u.LastName, u.DateOfBirth);
```

----

## What about performance?

If you were to compare query plans between the first method and the `EXISTS`/`EXCEPT` method, it appears the latter will generate a slightly more complicated execution plan.

However, I have found that despite this, the `EXISTS`/`EXCEPT` method almost always performs better, even with very large workloads. Not only do I consistently see it run faster, but it also requires significantly less reads on the dependent tables.
