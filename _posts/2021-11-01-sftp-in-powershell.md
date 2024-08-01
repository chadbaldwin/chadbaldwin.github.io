---
layout: post
title: "Working with secure FTP in PowerShell"
description: "Recently learned a new way to work with secure FTP in PowerShell"
date: 2021-11-01T07:00:00-07:00
tags: PowerShell
---

----

#### Update

Since posting this I've had a few people respond with some great suggestions, such as:

* [Posh-SSH PowerShell Module](https://github.com/darkoperator/Posh-SSH){:target="_blank"}
* [Transferetto PowerShell Module](https://github.com/EvotecIT/Transferetto){:target="_blank"}
* Using the `System.Net.FtpWebRequest` .NET class for working with FTPS in PowerShell

I'll definitely be checking these out to learn more about them and see how they compare to using the WinSCP module.

Thanks for all the suggestions and responses I've received to this post! This is how I improve my own skills by learning from you, and hopefully you learn a thing or two from me.

----

## Back to the post

> Disclaimer: While WinSCP does support FTPS, I will be focusing on SFTP in the examples since that's what I had at hand to test with. If you don't know the differences between FTP, SFTP or FTPS, there are plenty of resources online that cover it. The main thing to know is that SFTP/FTPS are secure alternatives to using plain FTP and the info I provide here, can easily be adjusted to work for FTPS.

For the impatient ones: [TL;DR](#tldr)

When building ETL processes in other languages (i.e. C#), usually I like to build a "draft" version of the process in PowerShell first. The code is shorter, there's less nuances to deal with and you can take advantage of some pretty great built in and community written modules. It's a nice, quick way to knock out a proof of concept.

Currently I'm working on a data append ETL/integration. These are pretty common...you send someone a CSV file, they do some stuff with it, add on some new columns of data, and send it back to you.

For me, it usually looks something like this:

* Run stored procedure in SQL
* Export results to CSV file abiding by the 3rd party's specs (i.e. headers, delimiter, quote qualifiers, line endings, header/trailer records)
* Copy file to their server via SFTP
* Wait for a response file to appear, could be minutes, could be days
* Download the response file to disk
* Parse and import file into a table in SQL
* Archive file

Over the years I've written dozens of these, one thing that often hangs me up are the "copy to SFTP" and "copy from SFTP" steps. usually what happens is I build two scripts...an "export script", which has a manual step of "open FileZilla and upload file", and then an Import script with another manual step to download the file.

After some Google searching to see how to handle SFTP in PowerShell, I ran into [this StackOverflow answer](https://stackoverflow.com/a/38735275/3474677){:target="_blank"} (the creator of WinSCP) which introduced me to some cool new alternatives for dealing with FTP, FTPS, SFTP, SCP, etc using PowerShell.

----

## Using built in commands

Linux is nice because it has native support for SSH, SCP and SFTP.

Windows is a bit different, by default, it does not. However, as of Windows 10 build 1809, there is now an optional feature for OpenSSH support (client and server) that can be installed directly in the OS or via PowerShell. [See the instructions here](https://docs.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse){:target="_blank"}. Once the client is installed, it will add the `ssh`, `scp` and `sftp` commands.

Another option would be to use [WSL](https://docs.microsoft.com/en-us/windows/wsl/install){:target="_blank"}, to run `ssh`, `scp` and `sftp`, though I would argue this is a bit overkill if that's the _only_ thing you plan to use it for. I highly recommend checking out WSL in general though, it's really fun to play with.

----

## Using WinSCP

While both of the methods mentioned above are great options and will get the job done, I learned a new method using WinSCP from that StackOverflow answer.

If you're not familiar with [WinSCP](https://winscp.net/){:target="_blank"}, it's been around for quite a while and is a very popular file transfer client for Windows.

Despite all the years I've used this tool, I never knew it has a .NET assembly that allows you to work with SFTP, FTP, S3, SCP, etc...all using .NET languages and environments...C#, VB.NET, PowerShell, and more.

But what really got my interest is a WinSCP PowerShell module...It does not appear to be "official" but it's trusted enough to be linked by the official WinSCP documentation.

The cool part about the Module is that it does not require the installation of WinSCP first, it uses its own copy of the WinSCP EXE and DLL files.

Without the module, you would need to load the DLL file as a new type into PowerShell using `Add-Type`, and then use it like you would in .NET, by using `New-Object`, calling class methods, and then disposing the objects when you're done. This can be a bit of a pain, at that point, you might as well be using C#. This is where the module comes in. The module is a wrapper for all of that and simplifies the implementation and usage. It also returns everything as objects, so you can easily work with them in PowerShell.

----

## TLDR

For those who hate reading and feel this is looking too much like a recipe write-up where I tell you my life story before giving you what you came here for, here's the 🥩 and 🥔's...

Various links:

* [Working with WinSCP via PowerShell](https://winscp.net/eng/docs/library_powershell#powershell_module){:target="_blank"}
* PowerShell Module
  * [Homepage](https://dotps1.github.io/WinSCP){:target="_blank"}
  * [Github repo](https://github.com/dotps1/WinSCP){:target="_blank"}
  * [PSGallery](https://www.powershellgallery.com/packages/WinSCP){:target="_blank"}

You can install the PowerShell module like normal:

```pwsh
# install module
Install-Module winscp

# import module into current session
Import-Module winscp
```

That's it, you're ready to go.

An overview of a few common commands:

```powershell
New-WinSCPSessionOption # Info about the connection you plan to make - Hostname, credentials, protocol, port, etc
New-WinSCPSession # Takes a SessionOption object, represents the active connection to the host
Remove-WinSCPSession # Takes a Session object, disconnects / disposes the active connection
Get-WinSCPHostKeyFingerprint # Return the public key of a remote host

Test-WinSCPPath # Test whether a path exists
Get-WinSCPItem # Return info about a file or directory
Get-WinSCPChildItem # Return info about the children of a specific item (i.e. list of files within a directory)

Send-WinSCPItem # Upload file(s)
Receive-WinSCPItem # Download file(s)
Remove-WinSCPItem # Delete file(s)
```

That's only a portion of the commands available. If you want more info, you'll need to read the docs :)

----

## Example

Here's an example of how it could be used:

```powershell
# Execute stored procedure usp_ExportData
# Export data as tab delimited, with double quote qualifiers to 'export.csv'
Invoke-DbaQuery -SqlInstance ServerA -Database DBFoo `
                -CommandType StoredProcedure -Query 'usp_ExportData' |
    Export-Csv -Path .\export.csv -Delimiter '|'

# Manually get credentials
# Could also use database, Amazon Secrets, Vault, SecretStore, config file, etc
$credential = Get-Credential

$options = @{
  Credential = $credential # This will provide the Username and Password
  Protocol = 'Sftp'
  HostName = 'sftp.someclient.com'
  GiveUpSecurityAndAcceptAnySshHostKey = $true
}

# Configure options for the session
$sessionOption = New-WinSCPSessionOption @options

# Open connection to server
$session = New-WinSCPSession -SessionOption $sessionOption

# Send export file to server via SFTP connection
Send-WinSCPItem -WinSCPSession $session -LocalPath .\export.csv

# Disconnect and dispose of connection
Remove-WinSCPSession -WinSCPSession $session
```

Note: `GiveUpSecurityAndAcceptAnySshHostKey = $true` is likely not something you want in a production process. Instead, you can get the public key of the remote host and supply it as a parameter to the SessionOption. If you don't know what the public key of the remote host is, it comes with a nifty cmdlet that gets it for you `Get-WinSCPHostKeyFingerprint -SessionOption $sessionOptions -Algorithm SHA-256`.

This is a fairly crude example, no error handling, not checking to see if the file already exists on the remote host, not using any sort of config file to make it reusable, etc. But I would say this was a pretty simple and quick script to run a proc, export to CSV and send it via SFTP to a remote host.
