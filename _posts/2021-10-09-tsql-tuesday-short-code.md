---
layout: post
title: "T-SQL Tuesday #143 – Short code examples"
description: "T-SQL Tuesday topic of the month: Short Code Examples by John McCormack"
date: 2021-10-12T07:00:00-07:00
tags: T-SQL-Tuesday
image: /img/companylogos/T-SQL-Tuesday-banner.png
---

[![T-SQL Tuesday Logo](/img/companylogos/T-SQL-Tuesday-logo.png){: style="width:200px; float:right;"}](https://johnmccormack.it/2021/10/t-sql-tuesday-143-short-code-examples/){:target="_blank"}
For the October [T-SQL Tuesday](http://tsqltuesday.com/){:target="_blank"} invitation, [John McCormack](https://johnmccormack.it/){:target="_blank"} is inviting others to share some of their favorite short code examples. These could be SSMS/SQL Prompt snippets, one liners, keyboard query shortcuts or snippets you've committed to memory. It doesn't have to be T-SQL, it could be Python, PowerShell, or anything else you use on a daily basis.

I'm excited that this will be my first time participating in a T-SQL Tuesday topic!

Most of my time is spent writing T-SQL, PowerShell and working in the PowerShell terminal, so that's how I'll split the post up.

I had to cut it short otherwise this post would be a mile long. If you're interested in seeing more quick tricks, SQL Prompt snippets, etc, please leave a comment and let me know and I can do a Part 2 in the future.

----

## T-SQL

### Right justify values

* While you usually shouldn't be formatting output at the data layer, I find this to be particularly useful when building utility stored procedures that are used directly and not feeding a report or an application.
* Note, be careful using `FORMAT()` it's pretty inefficient, but if your code only returns a handful of records, then there's likely no need to worry. Just don't use it on queries that are returning large datasets.

```tsql
SELECT NoAlign         = x.val
     , AlignRight      = RIGHT(CONCAT(SPACE(16), x.Val), 16)
     , AlignRightComma = RIGHT(CONCAT(SPACE(16), FORMAT(x.Val, 'N0')), 16)
FROM (
    VALUES (24114),(372559),(117940),(16),(0),(589892558),(46827)
) x(val);
```

![Screenshot of SSMS grid results showcasing how the align right sql logic looks](/img/tsltuesday143/20211009_122006.png)

### Divide by zero safe percentage

* This snippet gets used in almost every report I build. You need to return a percentage, but you need to handle NULL values. Most of the time, if the denominator is zero, then I want to return a percentage of 0%.
* Depending on whether you want to return the percentage as a whole number or as a decimal you can change the multiplier on the denominator. `0.01` will give you a whole number percentage whereas `1.00` will give you the percentage as a proper decimal.
* Once you write your percentage, you can convert / cast the result to the preferred data type, just be mindful of arithmetic overflows.

```tsql
DECLARE @Numerator   decimal(10,4) = 123456.1234,
        @Denominator decimal(10,4) = 689758.5678;
-- Return percentage as a whole
SELECT PctAsWhole   = CONVERT(decimal(6,3), COALESCE(@Numerator / NULLIF(@Denominator * 0.01, 0), 0.00))
-- Return percentage as a decimal
     , PctAsDecimal = CONVERT(decimal(6,5), COALESCE(@Numerator / NULLIF(@Denominator * 1.00, 0), 0.00));
```

![Screenshot of SSMS grid results showing the output of the safe percentage SQL snippet looks](/img/tsltuesday143/20211009_122541.png)

### Generating random numbers within a range

* These are great for generating test data
* The values returned by the snippets below could be fed into a `DATEADD()` function for generating random dates within a range

```tsql
-- Generate random number within an inclusive range
DECLARE @RangeStart int = 100,
        @RangeEnd int = 104;
SELECT FLOOR(RAND(CHECKSUM(NEWID()))*(@RangeEnd-@RangeStart+1))+@RangeStart;

-- Generate random number within a range of size n starting at point x
DECLARE @RangeStart int = 100,
        @RangeSize int = 5;
SELECT ABS(CHECKSUM(NEWID())%@RangeSize)+@RangeStart;

-- Randomly pick either 1 or -1
SELECT SIGN(CHECKSUM(NEWID()));

-- Randomly pick a number between -N and N (inclusive)
DECLARE @RangeSize int = 1;
SELECT CHECKSUM(NEWID())%(@RangeSize+1);
```

### Tally table

* Tally / Numbers tables can be used for all sorts of things. For example, avoiding cursors, loops, etc by performing those tasks by row. Jeff Moden has [a great article using a tally table to build a string split function](https://www.sqlservercentral.com/articles/tally-oh-an-improved-sql-8k-%E2%80%9Ccsv-splitter%E2%80%9D-function){:target="_blank"}. He's also [written about how tally tables can be used to replace loops](https://www.sqlservercentral.com/articles/the-numbers-or-tally-table-what-it-is-and-how-it-replaces-a-loop-1){:target="_blank"}.
* Another great use of them is generating sample data. Utilizing the snippets above for generating random numbers, you can easily generate random data for testing, including date ranges.
* Plenty of other bloggers have written about them, [including Itzik Ben-Gan](https://sqlperformance.com/2021/01/t-sql-queries/number-series-solutions-1){:target="_blank"} who I believe is the first person I learned this from.

```tsql
-- Using CTEs
-- Careful, this returns 1,000,001 rows if not limited
WITH c1 AS (SELECT x.x FROM (VALUES(1),(1),(1),(1),(1),(1),(1),(1),(1),(1)) x(x))  -- 10
    , c2(x) AS (SELECT 1 FROM c1 x CROSS JOIN c1 y)                                -- 10 * 10
    , c3(x) AS (SELECT 1 FROM c2 x CROSS JOIN c2 y CROSS JOIN c2 z)                -- 100 * 100 * 100
    , c4(rn) AS (SELECT 0 UNION ALL SELECT ROW_NUMBER() OVER (ORDER BY (SELECT 1)) FROM c3)  -- Add zero record, and row numbers
SELECT TOP(1000) x.rn
FROM c4 x;

-- Using XML
-- This is a method I came up with while trying to work on a SQL code golf problem
-- FYI, this has not been tested for efficiency against the CTE method
DECLARE @x xml = REPLICATE(CONVERT(varchar(MAX),'<n/>'), 1000); --Table size
WITH c(rn) AS (SELECT 0 UNION ALL SELECT ROW_NUMBER() OVER (ORDER BY (SELECT 1)) FROM @x.nodes('n') x(n))
SELECT c.rn
FROM c;
```

### Session settings for controlling plans and stats

* These ones I have to google almost every time because I forget what each one does.

```tsql
-- SET SHOWPLAN_TEXT      ON -- SET SHOWPLAN_TEXT      OFF -- Returns ESTIMATED execution plan info as a result set
-- SET SHOWPLAN_ALL       ON -- SET SHOWPLAN_ALL       OFF -- Returns ESTIMATED info, similar to SHOWPLAN_TEXT, but returns much more detailed info as additional columns
-- SET SHOWPLAN_XML       ON -- SET SHOWPLAN_XML       OFF -- Returns ESTIMATED execution plans as XML
-- SET STATISTICS XML     ON -- SET STATISTICS XML     OFF -- Returns ACTUAL execution plan as XML
-- SET STATISTICS PROFILE ON -- SET STATISTICS PROFILE OFF -- Returns ACTUAL execution plan as a result set
-- SET STATISTICS TIME    ON -- SET STATISTICS TIME    OFF -- Returns ACTUAL parse, compile, execution times for each statement in messages tab
-- SET STATISTICS IO      ON -- SET STATISTICS IO      OFF -- Returns ACTUAL disk activity metrics in messages tab

-- My most used snippet being:
SET STATISTICS IO, TIME ON;
```

----

## PowerShell / CLI

### Rename a column when using Select-Object

* A fairly simple one, but I remember how long I went before learning this when I first started out in PowerShell, so including it here is a must.

```powershell
gci | select @{N='FileName'; E={$_.Name}}
```

### Convert all files to UTF-8

* If you've ever dealt with storing your SQL files in git, you may have realized that UTF-8 isn't always the encoding of choice. Unfortunately, git doesn't like files encoded with things like UTF-16LE BOM.
* This is a snippet I like to use to convert whole directories recursively to UTF-8. This makes it easier for viewing diffs with git.

```powershell
gci -File -Recurse | ? Extension -In @('.sql') | % { $body = $_ | gc -Raw; $body | Set-Content -Encoding utf8 -NoNewline; }
```

### Clean out recursively empty directories

* This is probably one of my most used PowerShell snippets when it comes to file cleanup.
* The snippet will find all directories that contain no _files_ recursively. So if all you have is a chain of empty directories, it will remove it.
* Just be careful using this if whatever application is using the folder structure doesn't crash because it's unable to find the directory and does not create missing ones itself.

```powershell
# The '1' means "AllDirectories", aka, recurse
gci -Directory -Recurse | ? {-Not $_.GetFiles("*",1)} | rm -Recurse;
```

### First/Last N characters of a string

* Something I learned very quickly about PowerShell is that it's not nearly as forgiving as T-SQL when you are using the `LEFT()`, `RIGHT()` and `SUBSTRING()` functions. If you provide a length that is larger than the string length, PowerShell throws an error. This is a common practice in T-SQL, to provide a very large number to get "the rest" of the string from a certain point. But you can't do that in PowerShell.

```powershell
$string = 'foobar';
$n = 20

# First N:
$string.substring(0, [System.Math]::Min($n, $string.Length))
# Shorter alternative
$string[0..($n-1)] -join ''

# Last N:
$string.Substring($string.Length - [System.Math]::Min($n, $string.Length))
```

### Monitor a log file with filtering

* I often need to monitor an active log file to wait for a particular event to occur. Sometimes it can be difficult to catch if the file is extremely active.
* There are tools out there specifically for parsing and monitoring log files, but sometimes you don't have them available, such as on an auto created EC2 instance
* This command is useful for monitoring a log file and also passing in a list of filters to exclude or include
* The two filters use regex strings to perform the matching

```powershell
gc .\<filename>.log -Wait | ? { $_ -match '(error|warning)' } | ? { $_ -notmatch '(debug)' }
```

### Pseudo sudo

* Since windows doesn't yet support an alternative to the linux `sudo` command, I use this in my `$PROFILE` to make it easy to quickly spawn a shell window with admin privileges.

```powershell
function sudo {
    Start-Process pwsh -v RunAs;
};
```

### Set window title

* This is about as simple as it gets, but it's not as straight forward as I expected it to be in PowerShell. If you ever have something that auto-opens PowerShell windows, you might want to set the window title to something easily identifiable.
* Keep in mind, this title can quickly get overwritten by whatever you are running under it.

```powershell
$host.ui.RawUI.WindowTitle = 'changed title';
```

### Run SQL Server from Docker

* This is a straight copy-paste from the [SQL Server docker hub page](https://hub.docker.com/_/microsoft-mssql-server){:target="_blank"}. If you use Docker Desktop, this is an awesome way to quickly spin up a local instance of SQL Server, ready for all sorts of testing. I use this before every blog post to give me a clean working environment to test in, and then I can quickly and easily clean it up when I'm done by removing the container.

```powershell
docker run -e 'ACCEPT_EULA=Y' -e "MSSQL_SA_PASSWORD=${pass}" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2019-latest;
```

### Use ripgrep to search files

* I actually want to do a full length blog post just on this tool and other similar CLI workflows, but for now, I'm just putting this out there as a quick tip.
* This is more of a public service announcement than anything...Please install, learn and use [ripgrep](https://github.com/BurntSushi/ripgrep){:target="_blank"}. It is one of the most useful tools I have added to my CLI toolbelt. You will not regret it, _especially_ if you are a Windows user because the built in alternatives such as `FIND` in cmd and `Select-String` in PowerShell are _sooo sloooooowwwww_ compared to this, and don't even compare when it comes to features.

```powershell
rg -i some_text_or_regex_to_search
```

### Notepad++ alias

* Do yourself a favor and add an alias for notepad++. This is assuming Notepad++ is in your `PATHS` variable, if it isn't for you, that's outside the scope of this tip. But for my default installation, it is. Typing `notepad++.exe` can be a bit annoying, so I like to alias it to `npp` for when I need to pipe a list of files to open.

```powershell
Set-Alias -Name npp -Value 'notepad++.exe';
```

----

## Bonus

Shruggie: `¯\_(ツ)_/¯`

----

That's all I've got for you today...despite how long this post is, I really had to cut it short and leave a lot out. If you found any of these useful or if you have any snippets you'd like to suggest yourself, please leave a comment and let me know.
