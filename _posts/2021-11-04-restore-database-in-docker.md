---
layout: post
title: "Restore database from backup in Docker"
description: "Spent about an hour trying to restore a database to SQL Server in Docker. Decided to convert my notes to a blog post, hopefully this will help someone else out there who also didn't read the 20 other blog posts about it :)"
date: 2021-11-04T12:45:00-07:00
tags: Docker
---

If you google "restore sql database in docker", you'll probably find 20 other blog posts covering this exact topic...But, for some reason, I still managed to look right past them when I was stuck, and it took me a good hour or so to figure how to get this to work. So I'm sharing it anyway.

This is more of a personal note for future Chad to come back to.

Everything below is basically a summarized version of the official docs, with small tweaks here and there:
<https://docs.microsoft.com/en-us/sql/linux/tutorial-restore-backup-in-sql-server-container>

----

Yesterday, I was watching a Pluralsight course which provided a database `.bak` file to follow along with the examples. I generally like to use Docker when working with SQL Server locally...but as a somewhat novice user, I have found it to be a bit of a pain if you need to deal with restoring or attaching a database.

When I run into these scenarios, I usually spin up an AWS EC2 instance, install SQL server, and work with it that way. There's probably a simpler way to do it using RDS or Azure, but I'm not familiar with those just yet. The other option is if I have a Linux machine at hand, I will use that with Docker and mapped volumes work great.

I do happen to have a Linux machine ready to use...but I was determined to figure out how to get this working on Windows.

I was hoping that since I'm running WSL v2, that using a mapped volume would simply work, but for some reason, I could not get the container to see the files in the directory I mapped. I tried using something like this `-v /mnt/d/docker/volume:/var/opt/mssql/backup` but no luck. Docker would create the `backup` directory, but no files we're visible. To my best effort, my google-fu did not come up with any solutions.

I'll try to keep this as short and sweet as I can.

----

## Get the container running

This is the docker command I typically use to start an instance of SQL Server 2019 in Docker. Nothing fancy, it's pretty much a [copy paste from Docker Hub](https://hub.docker.com/_/microsoft-mssql-server){:target="_blank"}.

I personally like to use `-it`, which will mean the logs/output from the container are streamed to the console. I like being able to watch the output so I can spot when system errors pop up. It's generally not necessary, so if you prefer to run it silently in the background, then swap `-it` with `-d` to run in detached mode.

```powershell
docker run -it `
    --name sqlserver `
    -e ACCEPT_EULA='Y' `
    -e MSSQL_SA_PASSWORD='yourStrong(!)Password' `
    -e MSSQL_AGENT_ENABLED='True' `
    -p 1433:1433 `
    mcr.microsoft.com/mssql/server:2019-latest;
```

Once you run this, if you're using `-d` you'll probably want to check in on the container and make sure it's running without error using `docker ps -a`.

----

## Copy backup file into container

Now that the container is up and running, you need to copy the backup file.

If anyone knows how to get mapped volumes to work between Windows and this Linux SQL Server container...I would love your feedback/tips.

```plaintext
docker cp backup.bak sqlserver:/var/opt/mssql/data/
```

I'm choosing to copy this to the data directory because that's the default backup directory, and eliminates an extra step. Other solutions tell you to create a new `backup` directory, but in this case, since it's a sandbox, I don't really care about these types of best practices.

----

## Restore the database

This part will require a bit of manual tweaking on your part, but it's not too bad.

Open SSMS and connect to the instance using the credentials you set in the `docker run` command.

To restore the backup, you'll need to use the `RESTORE DATABASE...WITH MOVE` method. If you don't use `WITH MOVE`, you'll get an error, at least I do. To do that, you first need to know what the file names are inside of the `.bak` file, and then you need to construct the `RESTORE` using those file names.

So first run this to ensure you have access to the backup file, and it will list the files within the backup. No need to specify the full path to the file since we copied the backup file to the default directory.

```tsql
RESTORE FILELISTONLY FROM DISK = 'backup.bak'
```

Then using the list of file names returned by the above command, construct the backup script similar to below. Here you do need to specify the full destination path, for some reason it's unable to figure that out even when the default directories are explicitly set.

```tsql
RESTORE DATABASE RestoredDB
FROM DISK = 'backup.bak'
WITH
    MOVE 'backup'     TO '/var/opt/mssql/data/backup.mdf',
    MOVE 'backup_log' TO '/var/opt/mssql/data/backup_log.ndf'
```

And that's it, 3 steps...copy, list files, restore...assuming this all runs without error, you have now restored a database into a Linux Docker container running SQL Server on Linux.
