---
layout: post
title: "Fun with Unicode characters in SQL Queries"
description: "Unicode characters are a fun and useful way to help make your query results easier to read and even make some fun graphics."
date: 2024-07-09T07:00:00-07:00
tags: T-SQL
image: img/postbanners/2024-07-09-fun-with-unicode-in-sql-queries.png
---

I never thought this would make for a good blog post, but here we are. Every single time I share a query that uses Unicode characters, someone _always_ asks me what it is and why I'm using it. So now I have this blog post I can send to anyone who asks about it 😄.

I don't want to get too far into the weeds explaining encodings, code points, etc. Mostly because you can just Google it, but also because it's very confusing. Despite all the hours I've spent trying to learn about it, I still don't get a lot of it. There's also a lot of nuance regarding encodings when it comes to SQL Server, different collations, and different SQL versions. However, I did come across [this blog post](https://sqlrebel.org/2021/07/29/utf-16-and-utf-8-encoding-sql-server/){:target="_blank"} that seems to break it down well.

For the purposes of this post, all you really need to know is Unicode is what allows applications to support non-english text (`データベース`), special symbols (`•`, `™`, `°`, `©`,`π`), diacritics (`smörgåsbord`, `jalapeño`, `résumé`), and much more. Unicode makes all this possible.

Unicode is HUGE, and there are a ton of characters that most people don't even know exist. Sometimes I find myself scrolling through Unicode lookup sites just to see if I can find any cool/fun/useful characters I could use...A totally normal Saturday afternoon activity...👀

Out of all the random Unicode characters I've found...the one I use on a daily basis is `█`...that's it, just a plain boring block. For the most part, this blog post will be about how this one boring character can help make your SQL queries a little easier to look at.

----

## How do you type these!?

Before anyone asks "how do you type these"...To be honest, I don't, because I use SQL Prompt snippets where I've copy pasted my most used Unicode characters. I guess if you _really_ want to type them yourself every time, you can use keyboard shortcuts. [Here's a website I found](https://www.alt-codes.net/){:target="_blank"} that has a list of common Unicode symbols and their "alt codes". Where you hold alt and type the code. In the case of `█`, you would type `alt+219`.

‼ A very important note...if you are using ANY Unicode characters in a string literal in SQL Server, you have to make sure you prefix the string with `N`. Otherwise the Unicode characters won't render, and you'll just end up with blanks, question marks, etc. For example:

```tsql
SELECT N'This is a Unicode string in SQL Server! 🦄'
SELECT 'This is NOT a Unicode string in SQL Server! 😭' -- Except when using UTF-8 collations in 2019+...read the blog post linked above
```

----

## Adding a column set separator

Have you ever written a query that joins a whole bunch of tables with a `SELECT *` at the top? ...Of course you have, you're a SQL developer. The problem is now you're staring at a massive dataset 100 columns wide.

For example...

```tsql
SELECT *
FROM sys.indexes i
    JOIN sys.objects o ON o.[object_id] = i.[object_id]
    JOIN sys.stats s ON s.[object_id] = i.[object_id] AND s.stats_id = i.index_id
    JOIN sys.partitions p ON p.[object_id] = i.[object_id] AND p.index_id = i.index_id
```

Just scrolling through all those columns, how do you know which columns are in which table? You could probably figure it out pretty quick if you know the data and have a good idea what the first column in each table is, but I've found that to be annoying. If you were working in Excel, would you add any special border formatting to make it a little easier to read? Because I would.

In the past, I would do something like this...

```tsql
SELECT 'sys.indexes ->'  , i.*
    , 'sys.objects ->'   , o.*
    , 'sys.stats ->'     , s.*
    , 'sys.partitions ->', p.*
FROM ...
```

![Screenshot of SSMS data grid results using a column containing "sys.stats ->" as a way to visually separate related columns](/img/unicodequeries/20240708_155925.png)

Don't try to convince me that after staring at result grids all day that you're going to easily and quickly spot that out of 100 columns.

Now, my typical pattern is to do something like this:

```tsql
SELECT N'█ sys.indexes -> █'   , i.*
    ,  N'█ sys.objects -> █'   , o.*
    ,  N'█ sys.stats -> █'     , s.*
    ,  N'█ sys.partitions -> █', p.*
FROM ...
```

![Screenshot of SSMS data grid results using a column containing unicode block characters like "█ sys.stats -> █" to visually separate related columns](/img/unicodequeries/20240708_160956.png)

I find that to be _significantly_ easier to spot...Though, most times I really only do this...

```tsql
SELECT N'█' [█], i.*
    ,  N'█' [█], o.*
    ,  N'█' [█], s.*
    ,  N'█' [█], p.*
FROM ...
```

![Screenshot of SSMS data grid results using a column containing only unicode block characters like "█" to visually separate related columns](/img/unicodequeries/20240708_161344.png)

Does it make the SELECT portion of the queries just a little bit ugly? Sure, but I've gotten used to it. And I feel the pros outweigh the cons.

----

## Adding a visual row identifier

My second most common usage for `█` is to easily spot specific rows I'm targeting while looking at a larger dataset. For example, I have a table of records with expiration dates, but I'm doing some data analysis, looking for patterns and I want to see the whole dataset, and not _just_ those that are expired or vice versa.

Here's a sample query/data generator:

```tsql
SELECT TOP(100) x.ItemID, y.StartDate, z.ExpirationDate
    , Expired = IIF(z.ExpirationDate <= GETDATE(), N'██', '')
FROM (VALUES(1),(2),(3),(4),(5),(6),(7),(8),(9),(10)) x(ItemID) -- If you're on SQL2022 try using GENERATE_SERIES(1,10) 😁
    CROSS APPLY (SELECT StartDate      = DATEADD(MILLISECOND,-FLOOR(RAND(CHECKSUM(NEWID()))*864000000), GETDATE())) y
    CROSS APPLY (SELECT ExpirationDate = DATEADD(MILLISECOND, FLOOR(RAND(CHECKSUM(NEWID()))*864000000), y.StartDate)) z
```

And here's what that output might look like...

![Screenshot of SSMS data grid results using a column containing unicode block characters like "█" to visually identify target rows](/img/unicodequeries/20240708_164754.png)

Obviously, you don't HAVE to use Unicode here, you'd probably be just as well off using `1` or `##` or whatever you want. I personally find that this makes it incredibly obvious and easy to spot.

----

## Creating a bar chart

Now...this is more of a hack. By this point, if you're creating bar charts with Unicode in SQL queries, you should probably be using some sort of reporting/GUI tool anyway. But it's still fun.

I often find use in this because I can throw it into a simple utility script and then share that SQL script with others. It has the little bar graph graph in without them having to do anything special other than run it.

I won't paste the whole script, but you can see where I've done this in a [simple Drive Usage script here](https://github.com/chadbaldwin/SQL/blob/main/Scripts/Drive%20Usage.sql){:target="_blank"}.

The result of which looks like this:

![Screenshot of SSMS data grid results using unicode block characters like "█" and "▒" to build a bar chart for each record](/img/unicodequeries/20240708_171010.png)

Except here you'll notice I'm actually using two different characters. `█` to represent used space, and `▒` (`alt+177`) to represent unused space.

Which boils down to these expressions:

```tsql
DECLARE @barwidth int          = 50, -- Controls the overall width of the bar
        @pct      decimal(3,2) = 0.40; -- The percentage to render as a bar chart

-- Dark portion of the bar represents the percentage (ex. Percent used space)
SELECT REPLICATE(N'█', CONVERT(int,   FLOOR((    @pct) * @barwidth)))
     + REPLICATE(N'▒', CONVERT(int, CEILING((1 - @pct) * @barwidth)));

-- Light portion of the bar represents the percentage (ex. Percent free space)
SELECT REPLICATE(N'█', CONVERT(int,   FLOOR((1 - @pct) * @barwidth)))
     + REPLICATE(N'▒', CONVERT(int, CEILING((    @pct) * @barwidth)));
```

----

## Use as a delimiter

I'm pretty sure I stole this idea from Adam Bertrand, but I can't seem to find the post. The idea is to use a Unicode character that has a very unlikely chance of occurring in your data to use as a split point / delimiter.

The article I stole it from uses `nchar(9999)`, which is just this `✏`, a pencil, so that's also what I happen to use now. You could pick from thousands of other characters as long as it's not going to show up in your (hopefully clean) data.

For example, I'll occasionally write something like this...

```tsql
DECLARE @d nchar(1) = NCHAR(9999);

SELECT STRING_AGG(s.servicename, @d) WITHIN GROUP (ORDER BY s.servicename)
FROM sys.dm_server_services s
```

Which results in...

```plaintext
SQL Full-text Filter Daemon Launcher (MSSQLSERVER)✏SQL Server (MSSQLSERVER)✏SQL Server Agent (MSSQLSERVER)
```

This isn't necessarily a great option in all cases, you could also use something more appropriate like JSON or XML. But depending on what I'm working on, sometimes it's nice to have something a bit lighter weight.

----

## Wrap it up...

This is really only scratching the surface of what Unicode has to offer and how you can use it in SQL. I recommend checking out various Unicode blocks (related sections of characters). Some good ones to check out would be [block elements](https://unicode-explorer.com/b/2580){:target="_blank"} (what we've been using in this post), [box drawing](https://unicode-explorer.com/b/2500){:target="_blank"}, [arrows](https://unicode-explorer.com/b/2190){:target="_blank"} (there's actually like 4 blocks just for arrows), [playing cards](https://unicode-explorer.com/b/1F0A0){:target="_blank"}...just to name a few. You can view [the full list here](https://unicode-explorer.com/blocks){:target="_blank"}.

I've also seen some pretty cool stuff for writing 3D text in SQL comments, using box drawing characters to visualize a parent-child hierarchy (kinda like when you run the windows `tree` command), etc.

Let me know what some of your favorite tricks are using Unicode characters.
