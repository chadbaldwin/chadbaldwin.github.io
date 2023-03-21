---
layout: post
title: "THROW command is non-terminating across linked servers"
description: While working on a project, I realized today that the THROW command is non-terminating if returned by a stored procedure executed over a linked-server.
date: 2021-04-01 21:20:00 -0700
tags: T-SQL
image: /img/postbanners/2021-04-01-throw-non-terminating-with-linked-server.png
---

While working on a project today, I ran into an interesting issue I'd never encountered before.

The `THROW` command is non-terminating if it is used in a stored procedure over a linked-server.

I don't know the details to why it works this way. The `THROW` command returns an error message with a severity level of 16, which, according to my [RAISERROR Cheatsheet]({% post_url 2021-01-15-raiserror-cheatsheet %}){:target="_blank"}, does not stop execution.

There's something special about the `THROW` command beyond raising an error message. Behind the scenes, there is likely some extra information being passed to tell SQL Server that execution needs to stop in that moment, and that extra bit of information does not appear to be passed between linked servers.

----

### Setting up the demo instance

This was fairly easy to set up a demo script for. I personally tested this using SQL Server 2019 on Docker. Normally I wouldn't mention using Docker, but since this requires setting up a linked server, some of you may not have access to do so.

I won't walk through setting up docker or anything like that (I'd like to in a future blog post), but if you are already familiar with it, you can [go here](https://hub.docker.com/_/microsoft-mssql-server){:target="_blank"} to see what images are available. This is the command I used:

```plaintext
docker run -e 'ACCEPT_EULA=Y' -e 'MSSQL_SA_PASSWORD=yourStrong(!)Password' -p 1433:1433 -d mcr.microsoft.com/mssql/server:2019-latest
```

After that's all done and running, connect to the instance, and create a database:

```tsql
CREATE DATABASE SandBox;
GO
USE SandBox;
GO
```

----

### Recreating the issue

First, you need to add a linked server, if you already have one, then you can skip this step:

```tsql
EXEC sys.sp_addlinkedserver @server = 'LOCALHOST';
```

Thankfully I didn't need to set up an additional server to recreate this issue, it worked just fine using a linked server pointing at itself.

Next, let's create some sample stored procedures:

This one simply raises an exception using `THROW`:

```tsql
CREATE OR ALTER PROCEDURE dbo.Fail
AS
THROW 51000, 'Test', 1;
GO
```

The following two procs execute `dbo.Fail`, one locally, the other over a linked server. Then tries to output a message as test to see if the `THROW` caused our proc to terminate execution.

```tsql
CREATE OR ALTER PROCEDURE dbo.FailLocal
AS
EXEC SandBox.dbo.Fail;
RAISERROR('If you can see this, it didnt terminate',0,1) WITH NOWAIT;
GO
```

```tsql
CREATE OR ALTER PROCEDURE dbo.FailLinkServer
AS
EXEC LOCALHOST.SandBox.dbo.Fail;
RAISERROR('If you can see this, it didnt terminate',0,1) WITH NOWAIT;
GO
```

----

### Run the procs

Running the first proc should do exactly what I would expect it to do:

```tsql
EXEC SandBox.dbo.FailLocal
```

![image-20210401210959249](/img/throwlinkserver/image-20210401210959249.png)

`dbo.Fail` is run, it raises an exception, and as expected, all execution stops and the output message isn't returned.

Now run the second proc:

```tsql
EXEC SandBox.dbo.FailLinkServer
```

![image-20210401211337097](/img/throwlinkserver/image-20210401211207777.png)

This time, we ran `dbo.Fail` via our linked sever connection. But, rather than raising an exception and terminating execution, it continued on running.

----

### The remedy

I don't know if there are better ways to handle this, but in my case, my plan to get around this problem is to call the stored procedure from a try/catch block, and then rethrow the error from there.

Like so...

```tsql
CREATE OR ALTER PROCEDURE dbo.FailLinkServer
AS
BEGIN TRY
    EXEC LOCALHOST.SandBox.dbo.Fail;
END TRY
BEGIN CATCH
    THROW;
END CATCH;
RAISERROR('If you can see this, it didnt terminate',0,1) WITH NOWAIT;
GO
```

This way, any errors thrown by the stored procedure remotely, are re-thrown locally. After applying this fix, and running a test...

![image-20210401211758133](/img/throwlinkserver/image-20210401211758133.png)

Woohoo! Now it's working how I would expect it to work.
