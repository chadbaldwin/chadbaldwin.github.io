---
layout: post
title: "Insert Only New Rows With Nullable Key Columns"
description: "Dealing with a NULLs is always a pain. Here I show one way to nicely handle them while performing an insert which needs to join on a multi-part key with nullable columns"
date: 2021-10-07T19:41:00-07:00
tags: T-SQL
image: /img/postbanners/2021-10-07-insert-only-new-rows.png
---

I haven't posted in a while, so I thought I would throw a quick one together to hopefully restart the habit of writing and posting on a regular basis.

One of my first blog posts covered how to [only update rows that changed]({% post_url 2020-12-30-only-update-rows-that-changed %}){:target="_blank"}. In that post, I described a popular method that uses `EXISTS` and `EXCEPT` to find rows that had changed while also implicitly handling `NULL` values.

This will be a bit of a continuation on that so if you're not familiar with set functions like `UNION`, `EXCEPT` and `INTERSECT` then I would recommend reading that post first to get caught up.

In this post, instead of `EXISTS` and `EXCEPT` to look for records that are different in order to update them, I will be using `NOT EXISTS` and `INTERSECT` to insert records that do not exist in the target table.

----

### When NULLs are not an issue

This task is normally not very high on the difficulty scale. Most people would use one of these two methods

* Lets say for whatever reason, you have a 4 part key `KeyCol1, KeyCol2, KeyCol3, KeyCol4`.

```tsql
-- Using LEFT JOIN
-- Personally not a fan of this method - I prefer NOT EXISTS in this scenario
INSERT INTO dbo.TargetTable
    (KeyCol1, KeyCol2, KeyCol3, KeyCol4, Foo, Bar)
SELECT x.KeyCol1, x.KeyCol2, x.KeyCol3, x.KeyCol4, x.Foo, x.Bar
FROM #SomeOtherTable x
    LEFT JOIN dbo.TargetTable t ON t.KeyCol1 = x.KeyCol1 AND t.KeyCol2 = x.KeyCol2
                               AND t.KeyCol3 = x.KeyCol3 AND t.KeyCol4 = x.KeyCol4
WHERE t.Foo IS NULL
```

```tsql
-- Using NOT EXISTS
INSERT INTO dbo.TargetTable
    (KeyCol1, KeyCol2, KeyCol3, KeyCol4, Foo, Bar)
SELECT x.KeyCol1, x.KeyCol2, x.KeyCol3, x.KeyCol4, x.Foo, x.Bar
FROM #SomeOtherTable x
WHERE NOT EXISTS (
        SELECT *
        FROM dbo.TargetTable t
        WHERE   t.KeyCol1 = x.KeyCol1 AND t.KeyCol2 = x.KeyCol2
            AND t.KeyCol3 = x.KeyCol3 AND t.KeyCol4 = x.KeyCol4
    )
```

Both of these methods work...but only if your key columns are `NOT NULL`. I would bet most of the time this won't be an issue...buuuut this is a problem I ran into a few weeks ago. I was working on a project that imported data from an external source and that external source used a 4 part key and some of the fields used were nullable.

### How to deal with nulls

This is where the post hooks back into "[only update rows that changed]({% post_url 2020-12-30-only-update-rows-that-changed %}){:target="_blank"}".

My solution is to use the inverse of the update logic. Since we are not performing updates we don't need access to the target table within the scope of the `SELECT` statement. That means the table can also go into the `NOT EXISTS()` query.

```tsql
-- Using NOT EXISTS and INTERSECT
INSERT INTO dbo.TargetTable (KeyCol1, KeyCol2, KeyCol3, KeyCol4, Foo, Bar)
SELECT x.KeyCol1, x.KeyCol2, x.KeyCol3, x.KeyCol4, x.Foo, x.Bar
FROM #SomeOtherTable x
WHERE NOT EXISTS (
        SELECT x.KeyCol1, x.KeyCol2, x.KeyCol3, x.KeyCol4
        INTERSECT
        SELECT t.KeyCol1, t.KeyCol2, t.KeyCol3, t.KeyCol4
        FROM dbo.TargetTable t
    )
```

This allows you to search for records in `dbo.TargetTable` that match on all 4 key columns, including `NULL`. If no records are found, then it will insert the record. This ensures you only insert rows where the nullable multi-part key does not already exist in the target table. If the key needs to be unique across the whole table, then you still need to make sure you don't have duplicates in `#SomeOtherTable`, otherwise that will violate the UNIQUE constraint, but that is beyond the scope of this post.
