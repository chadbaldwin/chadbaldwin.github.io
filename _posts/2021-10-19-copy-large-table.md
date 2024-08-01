---
layout: post
title: "Copy a large table between servers, a couple wrong ways, maybe one right way"
description: "Have you ever needed to copy a giant 50 million record table from one server to another? Because I did...I failed a few times. But eventually I figured it out with the help of the SQL community."
date: 2021-10-19T07:00:00-07:00
tags: T-SQL
#image: /img/foo/bar.png
---

This was a task that popped up for me a few days ago...

You have a table with 50 million records and about 3GB in size. You need to copy it from `ServerA` to `ServerB`. You do not have permission to change server settings, set up replication, backup & restore, set up linked servers, etc. Only DML/DDL access.

...what do you do?

You may immediately have an answer...or you may have absolutely no clue. I was somewhere in the middle. I could think of a few ways...but none of them sounded ideal.

----

The majority of these solutions will be using `dbatools` cmdlets. If you're not familiar with what that is...I highly recommend you check it out, learn it, install it, use it.

More info here: <https://dbatools.io/>{:target="_blank"}

----

## A few disclaimers

While reading this post, please keep in mind...this is not about "best practices". The point is to show you the iterations of failure and success I went through to learn and figure this out.

These transfers were through my slow network connection. Running these transfers directly from server to server, or using a machine that lives on the same network will give much better performance.

This is why things such as "jump boxes" and servers dedicated to data transfer tasks can be very useful in cutting down these transfer times.

----

## Attempt #1 - Export to CSV using PowerShell

My immediate thought when I encountered this problem was...I'll export the table to CSV (as terrible as that sounds)...and then import that file to the other server.

Exporting data from SQL to CSV is something I do regularly for development, testing and reporting so I'm pretty comfortable with it. You can throw a script together pretty quickly using PowerShell and dbatools cmdlets.

```powershell
$Query = 'SELECT * FROM dbo.SourceTable';
Invoke-DbaQuery -SqlInstance ServerA -Database SourceDB -Query $Query |
    Export-CSV D:\export.csv
```

Explanation: Run the query stored in `$Query`, and export the results to file as a CSV.

### The failure

I kicked it off and let it run in the background. After an hour, I noticed my computer getting slower...and sloooower, so I checked in on it...

![Powershell sucking up nearly 11GB of memory](/img/copytable/20211016_093534.png)

Yeah, that's not good 🔥🚒

This wasn't too surprising. I've run into memory issues with PowerShell in the past, usually when working with large CSV files. I'm not sure if it's an issue with PowerShell or CSV related cmdlets.

I immediately killed the process. Checking the export file, it had only made it to about 2 million records, not even a dent in the 50 million we needed to export.

----

## Attempt #2 - Export to CSV using PowerShell...but do it better

Now I need to handle this memory issue. I've run into these before with PowerShell. Usually if you batch your process better these problems go away. So this was my next iteration...

```powershell
$c = 0; # counter
$b = 100000; # batch size
foreach ($num in 1..500) {
    write "Pulling records ${c} - $($c+$b)";
    $query = "
        SELECT *
        FROM dbo.SourceTable
        ORDER BY ID -- Sort by the clustered key
        OFFSET ${c} ROWS FETCH NEXT ${b} ROWS ONLY
    ";
    # write $query;
    Invoke-DbaQuery -SqlInstance ServerA -Database SourceDB -Query $query |
        Export-CSV E:\export.csv -UseQuotes AsNeeded -Append
    $c += $b;
}
```

This time, I broke the export up into batches of 100,000 records. I changed the query to sort the table by the clustered key, and added an `OFFSET` clause to grab the data in segments. FYI, the ranges output from the loop are not exact, it's just meant to give a basic idea of where it's at.

I'm doing a bit of math trickery here so I don't have to figure out when the loop needs to stop.

Since the table has just under 50 million records, and I'm pulling in batches of 100k, that's no more than 500 batches. So I'm using the range operator (`x..y`) to spit out a list of 500 values. Once the loop reaches the end of the range it will stop.

### Less failure

After kicking this process off and letting it run for a bit, I did some math and projected that it would take about 90 minutes to finish, and that's just to _export_ the data, I still needed to import the data to the other server.

On the upside, it was only using 234MB of RAM. So I guess that's better, but not good enough. So I killed the process to move on to the next attempt.

----

## Attempt #3 - Using the right tool for the job

I reached out to the [SQL Community Slack](http://aka.ms/sqlslack){:target="_blank"} to see if anyone had some better ideas. Almost immediately I had a couple great suggestions.

Andy Levy [![Twitter](/img/socialicons/twitter.svg)](https://twitter.com/ALevyInROC){:target="_blank"} [![Website](/img/socialicons/website.svg)](https://www.flxsql.com){:target="_blank"} recommended `Copy-DbaDbTableData` from dbatools.

Constantine Kokkinos [![Twitter](/img/socialicons/twitter.svg)](https://twitter.com/mobileck){:target="_blank"} [![Website](/img/socialicons/website.svg)](https://constantinekokkinos.com/){:target="_blank"} suggested the [`bcp.exe` SQL utility](https://docs.microsoft.com/en-us/sql/tools/bcp-utility?view=sql-server-ver15){:target="_blank"}.

Both options sounded good, but since I have quite a bit of experience with PowerShell as well as working with the dbatools library, I gave that a shot first.

### The final attempt

`Copy-DbaDbTableData` is made for this exact task. With a description of "Copies data between SQL Server tables".

Their documentation page has a handful of examples which made it easy to use...

```powershell
$params = @{
  # Source
  SqlInstance = 'ServerA'
  Database = 'SourceDB'
  Table = 'SourceTable'

  # Destination
  Destination = 'ServerB'
  DestinationDatabase = 'TargetDB'
  DestinationTable = 'TargetTable'
}

Copy-DbaDbTableData @params
```

This example uses a technique called [parameter splatting](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_splatting?view=powershell-7.1){:target="_blank"}. It allows you to set all of your parameters in a dictionary and then supply it to the function to help keep things nice and pretty.

### The SUCCESS

Immediately I could tell it was significantly faster, on top of the fact that it was performing the export and the import at the same time.

Total runtime was 28 minutes. That's right, 28 minutes to move all 50 million rows from one server to the other. Compared to my previous attempts...that's lightning quick.

----

## Honorable mentions and notes

### bcp.exe utility

The `bcp` utility can be used to export table/view/query data to a data file, and can also be used to import the data file into a table or view. I think you can accomplish many of the same tasks using dbatools cmdlets, but I do think `bcp` has some advantages that make it uniquely useful for a number of tasks.

* Can export table data to a data file with very low overhead (takes up less space than a CSV)
* Supports storing the table structure in an XML "format" file. This maintains datatypes for when you need to import the data. Rather than importing everything as character data, you can import it as the original datatype
* Maintains `NULL` values in the exported data rather than converting them to blank
* Is incredibly fast and efficient

These features and capabilities come as both pros and cons depending on the usage.

Here's a few great uses I could personally think of for `bcp`

* If you have table data you need to restore to SQL often, say for a testing or demo database, but you don't want/need to restore the entire DB every time. Store your table(s) as data files (and their XML format files) on disk. Then write a script that restores them using `bcp`.

* If you need to copy a table from one server to another, but you do not have direct access to both servers from the same machine. In that case `Copy-DbaDbTableData` isn't useful as it needs access to both machines. But with `bcp`, you can save the table to a data and format file, transfer them somewhere else, and then use `bcp` to import the data.

* Technically, you can generate a CSV using `bcp`, but when I tried it, I ran into a handful of issues. Such as...you can't add text qualification or headers, and the workarounds to add them may not be worth it. It also retains `NULL` values by storing them as a `NUL` character (`0x0`). If you're planning on sending this file out to another system...you'd likely want to convert those `NULL` values to a blank value. But if none of these caveats affect you...then this may be a great option since it's so fast at exporting the data to disk.

### Other dbatools cmdlets

I don't want to go into great detail on all of the ways dbatools can import and export data, but I thought I should at least mention the ones I know of, and give a very high level summary of what each is able to do:

* `Copy-DbaDbTableData`
  * `Table/View/Query -> Table`
  * Use this cmdlet if you need to copy data from one table to another table, even if that table is in the same database, a different database or even different servers.
  * Alias - `Copy-DbaDbViewData` - This cmdlet is just a wrapper for `Copy-DbaDbTableData`. The only difference is that it doesn't have a parameter for `-Table`. So it's probably best you just use `Copy-DbaDbTableData`.
* `Export-DbaDbTableData`
  * `Table -> Script`
  * Use this cmdlet if you want to export the data of a table into a `.sql` script file. Each row is converted into an insert statement. Be careful with large tables due to the high overhead. If you need to store a large amount of data...consider a format with lower overhead, such as csv, or using `bcp.exe` to export to a raw data file.
  * Does not support exporting views or queries
  * Internally, it is a wrapper for `Export-DbaScript`.
* `Import-DbaCsv`
  * `CSV -> Table`
  * Use this cmdlet if you want to import data from a CSV file. This cmdlet is very efficient at loading even extremely large CSV files.
* `Write-DbaDbTableData`
  * `DataTable -> Table`
  * I would argue this is one of the most versatile cmdlets for importing data into SQL. This cmdlet can import any DataTable object from PowerShell into a table in SQL. This allows you to import things like JSON, CSV, XML etc. As long as you can convert the data into a DataTable.
* `Invoke-DbaQuery`
  * `Query -> DataTable`
  * Use this cmdlet to export the results of a query to a DataTable object in PowerShell.
  * Technically, the default return type is an array of DataRow objects. But you can configure it to use a number of different return types.
  * The results of this can be written to CSV, JSON or fed back into `Write-DbaDbTableData` to write into another SQL table.
* `Table/View/Query -> CSV`
  * dbatools does not currently have a cmdlet dedicated for writing directly to CSV.
  * To achieve this, you can use `Invoke-DbaQuery ... | Export-CSV ...`, but be careful of memory issues as experienced in attempt #1 above.

As you can see...there's quite a few options to choose from.

----

## Final thoughts

Hopefully you were able to learn something from this post. It may not be showing you the _best_ way to do something, but I wanted to show that we don't always know the best way to do something. Sometimes we have to go through trial and error, sometimes we have to reach out and ask for help.

The next time this task pops up, I'll now have a few more tricks in my developer toolbelt to try and solve that problem.
