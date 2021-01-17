---
layout: post
title: Cheatsheet - SQL RAISERROR
description: All the quirks with using raiserror
date: 2021-01-15 11:22:00 -0800
tags: T-SQL
---

<style>
    pre {
    overflow-x: auto;
    }
    .note-wrapper {
        text-align: left;
    }
    td {
        text-align: center;
    }
    li {
        margin-bottom: 10px
    }
</style>


> Note: It is suggested in the documentation to use `THROW` when you can. However, there are times when you want more control over the severity level that is used. `THROW` is hardcoded to use severity level 16.

This was originally intended to only be a simple table, but then I decided to include demos and screenshots. So prepare yourself for a fairly boring blog post.

Every time I have to use `RAISERROR`, I always forget what all the different severity levels do..."Which ones will jump me to the catch block again?", "What severity do I need to use to fail a job step?"

Well, I finally got tired of it and put together a cheatsheet with the most relevant or quirky things I could think of. If you happen to have any additional information you'd like to contribute, feel free to send me an email, or submit a PR for the post.

(Sorry, had to break it up into two tables because I didn't want to figure out the CSS to make a wide table work for my site).

RAISERROR syntax:

[Official Documentation](https://docs.microsoft.com/en-us/sql/t-sql/language-elements/raiserror-transact-sql)

```tsql
RAISERROR ( { msg_id | msg_str | @local_variable }  
    { ,severity ,state }  
    [ ,argument [ ,...n ] ] )  
    [ WITH option [ ,...n ] ]
```

Most common usages (log a message, but don't throw an error):

```tsql
-- Log a simple message
RAISERROR('Log a simple message',0,1) WITH NOWAIT;

-- Log a message with time stamp using substitution parameters
DECLARE @currenttime varchar(30) = FORMAT(GETDATE(),'o');
RAISERROR('%s - Did some things',0,1,@currenttime) WITH NOWAIT;

WAITFOR DELAY '00:00:02' -- Do some stuff

SET @currenttime = FORMAT(GETDATE(),'o');
RAISERROR('%s - Did more things',0,1,@currenttime) WITH NOWAIT;
```

I like to use this rather than `PRINT 'Your message here'` for a number of reasons...

1. `PRINT` messages are buffered and only get flushed to the output occasionally, but `RAISERROR...WITH NOWAIT` gets flushed to output immediately, hence `NOWAIT`. 
2. `PRINT` messages can sometimes be returned out of order. I've especially found this when calling a stored procedure via linked server (though note below, severity levels 17-25 will also return messages out of executed order).
3. You can control the level of severity that is returned
4. `RAISERROR` allows for templating, like swapping in values.

Column descriptions:
* **Prevents output** - An error is thrown, SSMS switches you over to the "Messages" tab, and execution will *appear* to have stopped...but guess what...it didn't! (And I'll prove it in a demo)
* **Stops Execution / Kills Connection** - The code will stop executing wherever it's sitting, and you will be disconnected from the server. If you are mid-transaction, the transaction will be automatically rolled back, regardless of whether you have `SET XACT_ABORT ON`.
* **Fails Job Step** - If an error with this severity level is thrown, in a batch which was executed by a job, either directly, or in a stored procedure, the job step will report it failed. It's important to note, that despite reporting it failed...that does not necessarily mean the code stopped running where the error happened.
* **Transfers to CATCH Block** - If the error occurs while within a `TRY` block, control will be passed to the `CATCH` block

| From |  To  | Prevents output | Stops Execution / Kills Connection | Fails Job Step | Transfers to CATCH Block | WITH  |
| :--: | :--: | :-------------: | :--------------------------------: | :------------: | :----------------------: | :---: |
|  0   |  1   |                 |                                    |                |                          | [Any] |
|  2   |  9   |                 |                                    |      Yes       |                          | [Any] |
|  10  |      |                 |                                    |                |                          | [Any] |
|  11  |  16  |                 |                                    |      Yes       |           Yes            | [Any] |
|  17  |  18  |       Yes       |                                    |      Yes       |           Yes            | [Any] |
|  19  |      |       Yes       |                                    |      Yes       |           Yes            |  LOG  |
|  20  |  25  |       Yes       |                Yes                 |      Yes       |                          |  LOG  |

<table style="table-layout:fixed">
    <colgroup>
        <col style="width: 71px;">
        <col style="width: 49px">
        <col>
    </colgroup>
    <tbody>
        <tr style="font-weight: bold; vertical-align: middle;">
            <td >From</td><td>To</td><td >Output / Notes</td>
        </tr>
        <tr>
            <td>0</td><td></td>
            <td>
                <div class='note-wrapper'>
                    <pre>&lt;&lt;msg&gt;&gt;</pre>
                </div>
            </td>
        </tr>
        <tr>
            <td>1</td><td>9</td>
            <td>
                <div class='note-wrapper'>
                    <pre>&lt;&lt;msg&gt;&gt;<br>Msg 50000, Level &lt;&lt;severity&gt;&gt;, State 1</pre>
                </div>
            </td>
        </tr>
        <tr>
            <td>10</td><td></td>
            <td>
                <div class='note-wrapper'>
                    <pre>&lt;&lt;msg&gt;&gt;</pre>
                    The severity returned to SQL server, such as Jobs, is '0'
                </div>
            </td>
        </tr>
        <tr>
            <td>11</td><td>16</td>
            <td>
                <div class='note-wrapper'>
                    <pre style="color: red;">Msg 50000, Level &lt;&lt;severity&gt;&gt;, State 1, Line ##<br>&lt;&lt;msg&gt;&gt;</pre>
                </div>
            </td>
        </tr>
        <tr>
            <td>17</td><td>18</td>
            <td>
                <div class='note-wrapper'>
                    <pre style="color: red;">Msg 50000, Level &lt;&lt;severity&gt;&gt;, State 1, Line ##<br>&lt;&lt;msg&gt;&gt;</pre>
                    Output delayed to end in order of appearance
                </div>
            </td>
        </tr>
        <tr>
            <td>19</td><td></td>
            <td>
                <div class='note-wrapper'>
                    <pre style="color: red;">Msg 50000, Level &lt;&lt;severity&gt;&gt;, State 1, Line ##<br>&lt;&lt;msg&gt;&gt;</pre>
                    Output delayed to end in order of appearance<br>Can only be specified by members of the sysadmin role, using the WITH LOG option
                </div>
            </td>
        </tr>
        <tr>
            <td>20</td><td>25</td>
            <td>
                <div class='note-wrapper'>
                    <pre style="color: red;">Msg 2745, Level 16, State 2, Line ##<br>Process ID 87 has raised user error 50000, severity 24. SQL Server is terminating this process.<br>Msg 50000, Level 24, State 1, Line ##<br>&lt;&lt;msg&gt;&gt;<br>Msg 596, Level 21, State 1, Line ##<br>Cannot continue the execution because the session is in the kill state.<br>Msg 0, Level 20, State 0, Line ##<br>A severe error occurred on the current command. The results, if any, should be discarded.</pre>
                    Can only be specified by members of the sysadmin role, using the WITH LOG option
                </div>
            </td>
        </tr>
    </tbody>
</table>

---

&nbsp;

## Lets do a couple demos:

### *Prevents output*

Run this script...At first, it will "look" like the script stopped running as soon as it hit the error...but guess what...it didn't, the whole thing ran, but everything after the error message was not output, both to the results tab AND the messages tab.

```tsql
IF OBJECT_ID('tempdb..#tmp','U') IS NOT NULL DROP TABLE #tmp; --SELECT * FROM #tmp;
GO
SELECT 'Before the error';
RAISERROR('Raiserror with severity level 17',17,1) WITH NOWAIT;
/*
  SSMS should now have switched you over to the "Messages" tab to display the error
  Everything after this point will not be output to SSMS
  That includes both messages and query results
*/
SELECT 'After the error';
SELECT val = 'Insert into temp table after error' INTO #tmp;
RAISERROR('Another error message',0,1) WITH NOWAIT;
```

![asdf](/img/raiserror/20210115_102440.png)

![asdf](/img/raiserror/20210115_102428.png)

Now run this:

```tsql
SELECT * FROM #tmp;
```

![asdf](/img/raiserror/20210115_102608.png)

Wait what!? But...If `SELECT 'After the error'` never ran...then how did the temp table get populated?? Yup...Don't let this one screw you up, thinking it stopped where it threw.

---

&nbsp;

### *Stops Execution / Kills Connection*

This one is fairly straight forward.

Create a test table, and populate it with a few records

```tsql
CREATE TABLE dbo.RE_Test_Kill (
    TestCol varchar (100) NOT NULL,
);
GO
INSERT INTO dbo.RE_Test_Kill (TestCol)
VALUES (NEWID()),(NEWID()),(NEWID()),(NEWID()),(NEWID());
```

Now run this, which will start a transaction, attempt to delete records from `RE_Test_Kill`, but then will throw a severity level 20 error. This will cause the execution to stop in its tracks, kill your connection to the server, and will rollback the transaction. I threw `SET XACT_ABORT OFF;` in there just to show.

```tsql
SET XACT_ABORT OFF;
BEGIN TRAN;
    DELETE FROM dbo.RE_Test_Kill;
    RAISERROR('Raiserror with severity level 20',20,1) WITH LOG;
COMMIT;
```

![asdf](/img/raiserror/20210115_103156.png)

You can see in the output "5 rows affected". But what happened with the transaction?

```tsql
SELECT * FROM dbo.RE_Test_Kill
```

![asdf](/img/raiserror/20210115_103402.png)

So everything is still there, that must mean the transaction was rolled back.

```tsql
DBCC OPENTRAN;
```

![asdf](/img/raiserror/20210115_103526.png)

---

&nbsp;

### *Fails Job Step*

This one is a little more difficult to test, especially depending on what permissions you have. Here I'm creating a job with a step for each `RAISERROR` severity level, however, to keep it brief, I've only included the range ends. But you can expand this if you really want to.

So all you have to do, is run this script, and then execute the job. After the job finishes running (which is pretty much instant), you can check the job history to see which steps failed.

```tsql
EXEC msdb.dbo.sp_add_job @job_name = 'Raiserror testing';

DECLARE @jobId BINARY(16);
SELECT @jobId = job_id FROM msdb.dbo.sysjobs WHERE [name] = N'Raiserror testing';

EXEC msdb.dbo.sp_add_jobstep @job_id = @jobId, @step_name = N're00', @command = N'RAISERROR('' 0'', 0,1) WITH NOWAIT;', @on_success_action = 3, @on_fail_action = 3;
EXEC msdb.dbo.sp_add_jobstep @job_id = @jobId, @step_name = N're01', @command = N'RAISERROR('' 1'', 1,1) WITH NOWAIT;', @on_success_action = 3, @on_fail_action = 3;
EXEC msdb.dbo.sp_add_jobstep @job_id = @jobId, @step_name = N're02', @command = N'RAISERROR('' 2'', 2,1) WITH NOWAIT;', @on_success_action = 3, @on_fail_action = 3;
EXEC msdb.dbo.sp_add_jobstep @job_id = @jobId, @step_name = N're09', @command = N'RAISERROR('' 9'', 9,1) WITH NOWAIT;', @on_success_action = 3, @on_fail_action = 3;
EXEC msdb.dbo.sp_add_jobstep @job_id = @jobId, @step_name = N're10', @command = N'RAISERROR(''10'',10,1) WITH NOWAIT;', @on_success_action = 3, @on_fail_action = 3;
EXEC msdb.dbo.sp_add_jobstep @job_id = @jobId, @step_name = N're11', @command = N'RAISERROR(''11'',11,1) WITH NOWAIT;', @on_success_action = 3, @on_fail_action = 3;
EXEC msdb.dbo.sp_add_jobstep @job_id = @jobId, @step_name = N're16', @command = N'RAISERROR(''16'',16,1) WITH NOWAIT;', @on_success_action = 3, @on_fail_action = 3;
EXEC msdb.dbo.sp_add_jobstep @job_id = @jobId, @step_name = N're17', @command = N'RAISERROR(''17'',17,1) WITH NOWAIT;', @on_success_action = 3, @on_fail_action = 3;
EXEC msdb.dbo.sp_add_jobstep @job_id = @jobId, @step_name = N're18', @command = N'RAISERROR(''18'',18,1) WITH NOWAIT;', @on_success_action = 3, @on_fail_action = 3;
EXEC msdb.dbo.sp_add_jobstep @job_id = @jobId, @step_name = N're19', @command = N'RAISERROR(''19'',19,1) WITH LOG;', @on_success_action = 3, @on_fail_action = 3;
EXEC msdb.dbo.sp_add_jobstep @job_id = @jobId, @step_name = N're20', @command = N'RAISERROR(''20'',20,1) WITH LOG;', @on_success_action = 3, @on_fail_action = 3;
EXEC msdb.dbo.sp_add_jobstep @job_id = @jobId, @step_name = N're25', @command = N'RAISERROR(''25'',25,1) WITH LOG;', @on_success_action = 3, @on_fail_action = 3;
EXEC msdb.dbo.sp_add_jobserver @job_id = @jobId, @server_name = N'(local)';
```

![asdf](/img/raiserror/20210115_105923.png)

As you can see, severity levels 0, 1 and 10 are the only ones that did not fail the job step. It's also worth noting that severity level 10 actually reports to the job as severity level 0.

For cleanup:

```tsql
DECLARE @jobId BINARY(16);
SELECT @jobId = job_id FROM msdb.dbo.sysjobs WHERE [name] = N'Raiserror testing';
EXEC msdb.dbo.sp_delete_job @job_id = @jobId;
```

---

&nbsp;

### *Transfers to CATCH Block*

```tsql
-- Severity levels 0 - 10 do not get caught
BEGIN TRY;
    RAISERROR('Raiserror severity  0',  0, 1) WITH NOWAIT;
    RAISERROR('Raiserror severity  1',  1, 1) WITH NOWAIT;
    RAISERROR('Raiserror severity  2',  2, 1) WITH NOWAIT;
    RAISERROR('Raiserror severity  3',  3, 1) WITH NOWAIT;
    RAISERROR('Raiserror severity  4',  4, 1) WITH NOWAIT;
    RAISERROR('Raiserror severity  5',  5, 1) WITH NOWAIT;
    RAISERROR('Raiserror severity  6',  6, 1) WITH NOWAIT;
    RAISERROR('Raiserror severity  7',  7, 1) WITH NOWAIT;
    RAISERROR('Raiserror severity  8',  8, 1) WITH NOWAIT;
    RAISERROR('Raiserror severity  9',  9, 1) WITH NOWAIT;
    RAISERROR('Raiserror severity 10', 10, 1) WITH NOWAIT;
END TRY
BEGIN CATCH;
    SELECT 'Caught error in CATCH block, Severity level: ', ERROR_SEVERITY();
END CATCH;
```

![asdf](/img/raiserror/20210115_110536.png)

As expected, the code in the `CATCH` block was never run.

```tsql
-- Severity levels 11 - 19 will switch control to the catch block:
CREATE TABLE #caughterrors (SeverityLevel int)
BEGIN TRY RAISERROR('Raiserror severity 11', 11, 1) WITH NOWAIT	END TRY BEGIN CATCH INSERT INTO #caughterrors VALUES (ERROR_SEVERITY()) END CATCH;
BEGIN TRY RAISERROR('Raiserror severity 12', 12, 1) WITH NOWAIT	END TRY BEGIN CATCH INSERT INTO #caughterrors VALUES (ERROR_SEVERITY()) END CATCH;
BEGIN TRY RAISERROR('Raiserror severity 13', 13, 1) WITH NOWAIT	END TRY BEGIN CATCH INSERT INTO #caughterrors VALUES (ERROR_SEVERITY()) END CATCH;
BEGIN TRY RAISERROR('Raiserror severity 14', 14, 1) WITH NOWAIT	END TRY BEGIN CATCH INSERT INTO #caughterrors VALUES (ERROR_SEVERITY()) END CATCH;
BEGIN TRY RAISERROR('Raiserror severity 15', 15, 1) WITH NOWAIT	END TRY BEGIN CATCH INSERT INTO #caughterrors VALUES (ERROR_SEVERITY()) END CATCH;
BEGIN TRY RAISERROR('Raiserror severity 16', 16, 1) WITH NOWAIT	END TRY BEGIN CATCH INSERT INTO #caughterrors VALUES (ERROR_SEVERITY()) END CATCH;
BEGIN TRY RAISERROR('Raiserror severity 17', 17, 1) WITH NOWAIT	END TRY BEGIN CATCH INSERT INTO #caughterrors VALUES (ERROR_SEVERITY()) END CATCH;
BEGIN TRY RAISERROR('Raiserror severity 18', 18, 1) WITH NOWAIT	END TRY BEGIN CATCH INSERT INTO #caughterrors VALUES (ERROR_SEVERITY()) END CATCH;
BEGIN TRY RAISERROR('Raiserror severity 19', 19, 1) WITH LOG    END TRY BEGIN CATCH INSERT INTO #caughterrors VALUES (ERROR_SEVERITY()) END CATCH;
SELECT * FROM #caughterrors c ORDER BY c.SeverityLevel
```

![asdf](/img/raiserror/20210115_111128.png) ![asdf](/img/raiserror/20210115_111238.png)

No messages were logged because they were all caught and inserted into the temp table instead.


```tsql
-- Anything above severity level 19 will just kill the connection
-- I'm only including this for completeness
BEGIN TRY RAISERROR('Raiserror severity 20', 20, 1) WITH LOG END TRY BEGIN CATCH SELECT '', ERROR_SEVERITY() END CATCH;
BEGIN TRY RAISERROR('Raiserror severity 21', 21, 1) WITH LOG END TRY BEGIN CATCH SELECT '', ERROR_SEVERITY() END CATCH;
BEGIN TRY RAISERROR('Raiserror severity 22', 22, 1) WITH LOG END TRY BEGIN CATCH SELECT '', ERROR_SEVERITY() END CATCH;
BEGIN TRY RAISERROR('Raiserror severity 23', 23, 1) WITH LOG END TRY BEGIN CATCH SELECT '', ERROR_SEVERITY() END CATCH;
BEGIN TRY RAISERROR('Raiserror severity 24', 24, 1) WITH LOG END TRY BEGIN CATCH SELECT '', ERROR_SEVERITY() END CATCH;
BEGIN TRY RAISERROR('Raiserror severity 25', 25, 1) WITH LOG END TRY BEGIN CATCH SELECT '', ERROR_SEVERITY() END CATCH;
```

These examples are only here for completeness. They won't get caught by the `CATCH` block, and only the first one will run.

---

&nbsp;

### *Bonus demo: messages returned out of order*

If you notice, in the second table, for severity levels 17-19, I note that the messages are returned out of order. I'll show you want I mean here:

If you look at this, you'd probably expect to see these messages returned in the same order they are executed...

```tsql
RAISERROR('Raiserror severity 17', 17, 1);
RAISERROR('Raiserror severity 18', 18, 1);
RAISERROR('Raiserror severity 19', 19, 1) WITH LOG;
RAISERROR('Raiserror severity  1',  1, 1);
RAISERROR('Raiserror severity  2',  2, 1);
RAISERROR('Raiserror severity  3',  3, 1);
```

But if you run it, you'll see that's not the case.

![asdf](/img/raiserror/20210115_111756.png)

Despite severity levels 17, 18 and 19 being first in execution, their output gets deferred to last.