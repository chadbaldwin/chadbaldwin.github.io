---
layout: post
title: Clean up your queries and simplify logic with CROSS APPLY
description: Reuse code within a SQL query using CROSS APPLY without hurting performance.
date: 2021-01-07 08:02:44 -0800
tags: T-SQL
---

### For you impatient readers, you can click here: [tl;dr](#using-cross-apply)

[DRY...Don't Repeat Yourself.](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself){:target="_blank"}

There are multiple ways to re-use code in SQL, such as [subqueries](https://docs.microsoft.com/en-us/sql/relational-databases/performance/subqueries){:target="_blank"} and [CTEs](https://docs.microsoft.com/en-us/sql/t-sql/queries/with-common-table-expression-transact-sql){:target="_blank"}; But I'd like to show you another way utilizing `CROSS APPLY`.

Subqueries and CTEs are great, but they're not exactly easy to daisy chain. What if you wanted to declare some kind of "inline variable" that you can assign a formula to, and then reference multiple times?

A lot of people who are new to SQL think that you can write something in the `SELECT` clause, assign an alias, and then re-use that alias throughout the query. They soon realize that will throw an error. This is because aliases assigned in the `SELECT` clause are only accessible in the `ORDER BY`.

But, using `CROSS APPLY`, you can sort of achieve this.

----

## Sample data

```tsql
IF OBJECT_ID('tempdb..#Contact','U') IS NOT NULL DROP TABLE #Contact; --SELECT * FROM #Contact
CREATE TABLE #Contact (
    ContactID   int             NOT NULL IDENTITY(1,1) PRIMARY KEY,
    FullName    varchar(100)    NOT NULL,
    DateOfBirth date                NULL,
    City        varchar(50)         NULL,
    [State]     varchar(2)          NULL,
    PhoneNumber varchar(20)         NULL,
);

INSERT INTO #Contact (FullName, DateOfBirth, City, [State], PhoneNumber)
VALUES ('Tyler Durden'  , '1973-03-06', 'Wilmington' , 'DE', '(210) 658-5511')
    ,  ('Biff Tannen'   , '1937-03-27', 'Hill Valley', 'CA', '2274651')
    ,  ('Marla Singer'  , '1976-10-24', 'Wilmington' , 'DE', '239.339.4195')
    ,  ('Marty McFly'   , '1968-06-12', 'Hill Valley', 'CA', '626-867-5309')
    ,  ('Emmett Brown'  , '1946-05-16', 'Hill Valley', 'CA', '626/214-2760');
```

----

## The Challenge

Let's try to do something really ugly just for the sake of teaching.

Try to write a query that takes a "Contact" table, which has a phone number column with data entered in various formats. Strip out all of the "bad" characters, and return the phone number and the area code in separate columns along with all other columns in the table.

So, if the value is `(210) 658-5511`, then your query should return `210` and `658-5511`, along with all other Contact table columns.

You can probably imagine how ugly this is going to get...but think about how you would do it...

**Tip**: Note that not ALL phone numbers contain an area code...

----

## The conventional way

```tsql
SELECT c.ContactID, c.FullName, c.DateOfBirth, c.City, c.[State]
    , AreaCode =  
        CASE
            WHEN LEN(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.PhoneNumber,'(',''),')',''),'.',''),'/',''),'-',''),' ','')) = 10
                THEN LEFT(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.PhoneNumber,'(',''),')',''),'.',''),'/',''),'-',''),' ',''), 3)
            ELSE NULL
        END
    , PhoneNumber =  
        CASE
            WHEN LEN(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.PhoneNumber,'(',''),')',''),'.',''),'/',''),'-',''),' ','')) IN (7,10)
                THEN STUFF(RIGHT(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.PhoneNumber,'(',''),')',''),'.',''),'/',''),'-',''),' ',''), 7),4,0,'-')
            ELSE NULL
        END
FROM #Contact c;
```

![Query Result](/img/queryresults/dry_cross_apply.png)

It works...But oof, that is really ugly 😭

Unfortunately we had to copy paste that ugly replace logic 4 times, and it's pretty hard to read.

Lets make this even worse...Only return rows that have an area code :)

Now you need to copy paste it again...

```tsql
WHERE LEN(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.PhoneNumber,'(',''),')',''),'.',''),'/',''),'-',''),' ','')) = 10
```

----

## Using CTEs

CTEs are a great tool, allowing you to re-use a table expression multiple times. But they're not great about allowing you to re-use a column expression.

```tsql
WITH cte_1 AS (
    SELECT c.ContactID, c.FullName, c.DateOfBirth, c.City, c.[State]
        , CleanPhone = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.PhoneNumber,'(',''),')',''),'.',''),'/',''),'-',''),' ','')
    FROM #Contact c
), cte_2 AS (
    SELECT c.ContactID, c.FullName, c.DateOfBirth, c.City, c.[State]
        , AreaCode =  
            CASE
                WHEN LEN(c.CleanPhone) = 10
                    THEN LEFT(c.CleanPhone, 3)
                ELSE NULL
            END
        , PhoneNumber =  
            CASE
                WHEN LEN(c.CleanPhone) IN (7,10)
                    THEN STUFF(RIGHT(c.CleanPhone, 7),4,0,'-')
                ELSE NULL
            END
    FROM cte_1 c
)
SELECT c.ContactID, c.FullName, c.DateOfBirth, c.City, c.[State]
     , c.AreaCode
     , c.PhoneNumber
FROM cte_2 c
WHERE c.AreaCode IS NOT NULL;
```

This really isn't too bad. We only had to write the `REPLACE` logic once, and re-use it multiple times. The down side here, is we really only wanted to work with one column in the `#Contact` table; But we still had to pass every column through to each CTE.

What if next month, a new field is added to the table? Now you have to add it to the top CTE and route it all the way through. This would be even worse if `#Contact` had 20+ columns. That would get real ugly.

----

## Using CROSS APPLY

Just a quick refresher...`CROSS APPLY` takes whatever expressions you put into it, and runs it for every row in the outside query. Generally, they are used for more complex tasks, like "find the most recent order for every customer". But in this case, we're simply returning a single record that contains the changes we made to a column.

```tsql
SELECT c.ContactID, c.FullName, c.DateOfBirth, c.City, c.[State]
    , p.AreaCode, p.PhoneNumber
FROM #Contact c
    CROSS APPLY (
        SELECT CleanPhone = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.PhoneNumber,'(',''),')',''),'.',''),'/',''),'-',''),' ','')
    ) cp
    CROSS APPLY (
        SELECT AreaCode =   CASE
                                WHEN LEN(cp.CleanPhone) = 10
                                    THEN LEFT(cp.CleanPhone, 3)
                                ELSE NULL
                            END
        , PhoneNumber =     CASE
                                WHEN LEN(cp.CleanPhone) IN (7,10)
                                    THEN STUFF(RIGHT(cp.CleanPhone, 7),4,0,'-')
                                ELSE NULL
                            END
    ) p
WHERE p.AreaCode IS NOT NULL;
```

Note that for this usage of `CROSS APPLY` we leave out the `FROM` clause and there's no need to include the outer table.

The great thing about this method, is you can re-use any of those columns in any of the queries clauses...`SELECT`, `WHERE`, `ORDER BY`, `GROUP BY`, `HAVING`...No repeated code. Once you're familiar with this style, it's pretty easy to read.
