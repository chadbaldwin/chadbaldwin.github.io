---
layout: post
title: Parsing a pipe delimited file to get a unique list of values
description: Today I needed to quickly parse a pipe delimited data file in order to get a unique list of values from one of the columns.
date: 2021-03-23 20:40:00 -0700
tags: Quick-Post
#image: [[/img/postbanners/path to post banner image.png]] # 1200 x 627
---

This is a new type of blog post I want to try my hand at. It isn't meant to be a step by step instructional post. I'm not going to spend time teaching the fundamentals, or explaining _why_ I did something the way I did, unless it's relevant.

The point is to show a problem I ran into, and how I chose to go about solving it using tricks I've picked up over the years, or maybe a new trick I just learned that day. I'd also like to encourage you readers to reply to these posts explaining how _you_ would do it, or how I could improve my workflow.

This also acts as a type of daily notes I can refer back to for snippets or tricks I can re-use.

With all that said...here is todays post....

----

First, lets get something out of the way. The term CSV to mean "Comma Separated Values" is outdated. If you work in a job that deals with data files for long enough, you'll learn very quickly that when people say "CSV", **many** times, they don't actually mean "_Comma_ Separated Values"...they _actually_ mean...tab separated, semicolon separated, pipe separated, fixed width, etc. I've seen all kinds of characters used for "CSV" files.

So, let's start reading "CSV" to mean "_Character_ Separated Values". Otherwise, we'll need a new file extension for every type of separator used.

## Parse a CSV file to get a unique list of values

Today I needed to get a list of unique values from a pipe delimited file in order to use them in a SQL query to look something up.

Here's some details...

* Tab delimited, no text qualifiers
* The file is 50MB in size
* Has about 900,000 rows
* There is no header row
* There's 9 columns

Randomly generated sample data:

```plaintext
18388957|123|20005|USA|18952198258|0|13582653771||VALID
12698826|123|20002|USA|17643290221|0|12806032637||NOT VALID
10613415|123|20002|USA|18890880807|0|11341756819|500|VALID
17500030|123|20004|USA|16310362154|0|16355725257||NOT VALID
11479197|123|20004|USA|10320813357|0|12485700219||VALID
10522885|123|20004|USA|14651144422|0|16995697603||VALID
18534801|123|20004|USA|14538787708|0|10900573396||VALID
12756630|123|20001|USA|11922515040|0|19687727269||VALID
16917302|123|20005|USA|14330030550|0|18116466987||VALID
15466721|123|20004|USA|12420975869|0|14397103976||NOT VALID
18386782|123|20004|USA|16179922470|0|15402927876||NOT VALID
19194324|123|20000|USA|18634580725|0|19057521699||VALID
16335654|123|20002|USA|14134387994|0|19996641965||NOT VALID
17738081|123|20001|USA|13695038257|0|15545772837||VALID
14472713|123|20003|USA|10608032367|0|16478305812||VALID
18090814|123|20001|USA|18791479787|0|14043599528|500|NOT VALID
19445583|123|20000|USA|18410087438|0|17445700376||VALID
11770343|123|20003|USA|11261639331|0|17342769284||NOT VALID
11457058|123|20003|USA|12858550998|0|17274074165||VALID
10589892|123|20002|USA|17383447914|0|11964452418|500|VALID
```

You need to extract a list of unique values from column 3 to use like this `WHERE x.Column IN (20001, 20002...)`

Before you continue reading...I want you to think about how _you_ would do this...where do you start? What are your first thoughts? These are the things I want to know and learn from, feel free to post in the comments.

----

### How I chose to do it

My first thought, in hindsight, seems to be the hardest, slowest way possible.

#### Using Notepad++

1. Open file in Notepad++
2. Find using regex to capture the value of the 3rd column - Find: `^.+?\|.+?\|(.+?)\|.*$`
3. Replace every row with only the captured value - Replace: `$1`
4. Then (using the TextFX plugin) sort and return unique values

I got to step 3, and then realized that it was the slow way when Notepad++ completely froze trying to perform all the replacements.

I killed notepad++.exe and moved on to try another method. It probably would have been faster to just use Excel at this point, but, I'm weird, and this time I chose to use my good friend PowerShell.

#### Using PowerShell

PowerShell only requires two commands to do this. The downside is, it loads the whole file into memory, and generally doesn't release that memory. So if it's a huge 2GB file, it's not a great option. In this case, I'm okay with loading a 50MB file into memory.

1. Load the data into a local variable using the `Import-Csv` cmdlet

    ```ps
    $data = Import-Csv -Delimiter '|' -Path .\file.txt -Header 'c1','c2','c3','c4','c5','c6','c7','c8','c9'
    ```

2. Get list of unique values from column 3

    ```ps
    $data | select c3 -Unique
    ```

#### Converting a list of values to an IN statement

Now that I have my list of values, I need to convert it into something I can easily paste into an `IN` statement, there's quite a few ways to do this.

* Manual/By hand - if it's a small list, just manually add a comma to the beginning or end of each value, and single quotes if needed.
* Block editing - Still manual, but it's faster than doing each value, one by one. Google "block editing in ssms" or "block editing in notepad++" and you'll find a few blog posts and videos showing you how to do it. In the future I'd like to blog about this showing various tips and tricks you can do with it.

If you have a list of maybe 1,000+ values...then you need to start using trickier methods, like...

* Notepad++ find/replace with regex to add a comma and quotes (if needed) to each line
* Notepad++ using a keyboard macro in Notepad++
* Excel - You can use a formula to add some prepend/append text, and then use autofill to apply it to every row of data like `="'"&A1&"',"`, which will add single quotes and a comma.

In this case, I only had about 10 unique values, so I did it manually.

----

> Update: On Reddit, u/bis noted that my statement regarding how PowerShell handles memory isn't entirely accurate. I thought PowerShell would allocate memory for the file no matter what you did with the contents (save to variable, write to file, did nothing, etc). After we did some testing, we found that to be wrong.
>
> In my example above, I'm writing the contents to a variable, so it definitely will allocate enough memory **at least** the size of the file. I did this to make it easier to explain, but I should include a clean one-liner to show how to do it.
>
> u/bis also pointed out that you can use `Set-Clipboard` to save the result to the clipboard directly.

With regard to the notes above...and using some additional PowerShell syntactic shortcuts, this is a nifty one liner that will do the job:

```ps
((ipcsv .\file.txt '|' -H a,b,c).c | sort | gu) -join ',' | scb
```

Resulting in `20000,20001,20002,20003,20004,20005`

Explanation of terms used:

* `ipcsv` is the default alias for `Import-Csv`
  * Two parameters can be specified by position (according to the documentation) `-Path` is first, `-Separator` is second.
  * Then, PowerShell allows you to shortcut parameter names as long as they aren't ambiguous. So `-H` just means `-Header`, since no other parameters start with `-H`.
  * You might also notice that I'm only listing 3 header names instead of 9 like before. This is because I read the documentation and found that `Import-Csv` will only return fields from rows _up to_ the fields listed in the header. So if you have a file with 9 columns, but only supply headers for the first 3, then it will only import the first 3 columns.
* `sort` is the default alias for `Sort-Object`
* `gu` is the default alias for `Get-Unique` which returns a unique list of values from an already sorted list. I decided to use `sort | gu` because it was shorter than using `select '3' -Unique`.
* `-join` concatenates all values in a list together using a delimiter
* `scb` is the default alias for `Set-Clipboard`, which writes the result to the clipboard.

----

> Update #2: In researching this more, and while writing the first update, I learned about the `Join-String` cmdlet and I felt it was such a useful cmdlet, that it was worth adding a second update.

Here's another way similar to the one above, it's slightly longer to type, but, I think it's more understandable, and more flexible for other uses:

```ps
ipcsv .\file.txt '|' -H a,b,c `
    | select c -Unique `
    | Join-String c ',' `
    | scb
```

I actually like this one more for a few reasons. I like that it doesn't use parentheses to control the flow. For one-liners, multiple sets of parentheses can make it hard to read, and it's harder to type.

It uses less cmdlets to get the job done. Instead of using `sort`, `gu`, `-join`, it's using `select` and `Join-String`.

`Join-String` seems to be a better fit for the job because it has a built in `-SingleQuote` parameter as well as `-OutputPrefix`, `-OutputSuffix` parameters. So you could do something like this:

```ps
ipcsv .\file.txt '|' -H a,b,c `
    | select c -Unique `
    | Join-String c ',' -OutputPrefix 'IN (' -OutputSuffix ')' -SingleQuote `
    | scb
```

Which results in this: `IN ('20005','20002','20004','20001','20000','20003')`

So if you're working with a list of strings, rather than a list of integers. It makes it easy to add single quotes.

----

There's lots of ways all of this could have been done. I tend to like using Regex and PowerShell, even if it does take a bit longer because I usually learn something new along the way. For example, in this scenario, I had never used PowerShell to load a file without a header. Now I know `Import-Csv` lets you supply a list of header names.

----

For those curious how I generated the sample data, here's the SQL script I used to do it:

```tsql
WITH c1 AS (SELECT x.x FROM (VALUES(1),(1),(1),(1),(1),(1),(1),(1),(1),(1)) x(x))
    , c2(x) AS (SELECT 1 FROM c1 x CROSS JOIN c1 y)
SELECT TOP(20)
    CONCAT(
          CONVERT(bigint, FLOOR(RAND(CHECKSUM(NEWID()))*10000000)+10000000)
        , '|123|', FLOOR(RAND(CHECKSUM(NEWID()))*6)+20000
        , '|USA|', CONVERT(bigint, FLOOR(RAND(CHECKSUM(NEWID()))*10000000000)+10000000000)
        , '|0|', CONVERT(bigint, FLOOR(RAND(CHECKSUM(NEWID()))*10000000000)+10000000000)
        , '|', IIF(CHECKSUM(NEWID()) % 6 = 0, 500, NULL)
        , '|', IIF(CHECKSUM(NEWID()) % 3 = 0, 'NOT VALID', 'VALID')
    )
FROM c2 x
```
