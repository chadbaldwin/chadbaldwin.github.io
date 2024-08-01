---
layout: post
title: "\"There's no way that will run\""
description: Things that you probably didn't think would actually run in SQL Server
date: 2021-02-17 08:40:00 -0800
tags: T-SQL
image: /img/postbanners/2021-02-17-theres-no-way-that-will-run.png
---

Have you ever seen some piece of code where you looked at it and thought "Okay, come on...there is no way that will run"...And then it somehow magically does?

Or maybe, the code looks completely normal, you run it, only to realize it does something completely different than you were expecting it to do.

Well, that's what we're here to do today. All of my previous blog posts have been about serious tips and tricks for you to use. But today, I wanted to have some fun and write about some of the things I've come across that have really messed with me and others. Sometimes I'll sprinkle them into my own (non-production) code, just to see who is paying attention.

----

### The shortest variable name ever

```tsql
DECLARE @ int = 100;
SET @ += 10;
SELECT @;
```

Oh, and it works for stored procedure parameters too...

```tsql
CREATE OR ALTER PROCEDURE #usp_TestProc (
    @ varchar(100)
)
AS
BEGIN;
    SELECT @;
END;
GO
EXEC #usp_TestProc @ = 'Testing';
```

### And its friend, the shortest temp table name ever

(thanks to Adam Machanic for recently showing me this one)

```tsql
SELECT TOP(100) *
INTO #
FROM sys.objects;

SELECT *
FROM #;
```

----

### Emojis for object names?

Why waste all those precious keystrokes on naming things when you can just use pictures. Wouldn't you much rather have a database named 🍕?

I think this one is a bit of a dead horse, but I can't help from sharing it because it's so hilarious.

```tsql
CREATE DATABASE [🍕];
GO
USE [🍕];
GO
CREATE SCHEMA [🥑];
GO
CREATE TABLE [🍕].[🥑].[🍔] (
    [🍅] nvarchar(10)
);
GO
INSERT INTO [🍕].[🥑].[🍔] ([🍅])
VALUES (N'🚀');

SELECT [🍅]
FROM [🍕].[🥑].[🍔];
```

Unfortunately, yes, the square brackets are necessary.

I definitely should not have written this part while hungry. Now I'm craving pizza.

----

### When dividing by zero doesn't matter...

The next time someone tells you that you should use `SELECT 1` over `SELECT *` or some other constant...you can show them this to prove you can put almost anything there and it won't matter...

```tsql
IF EXISTS (SELECT 1/0 FROM sys.objects)
BEGIN;
    SELECT N'Hooray! 🍕';
END;
```

However, I wouldn't recommend using this one in production. Microsoft could one day decide that maybe it should throw an error after all...whoops...now all that code is magically broken after upgrading SQL Server.

It works here too:

```tsql
SELECT *
FROM sys.objects
WHERE EXISTS (SELECT 1/0 FROM sys.tables);
```

And also here...

```tsql
SELECT *, rn = ROW_NUMBER() OVER (ORDER BY 1/0)
FROM sys.objects;
```

This will apply a row numbering scheme without caring about order. However, I would say that using `ORDER BY (SELECT NULL)` is much safer. But this is a fun one to mess with people.

----

### C̬͖͚͙͉̰̒̆ͥö͙̜̮́r̞̤͐ͪr͍u̩̘̳p̪̖̳͙̯ͤ͗ͨͧ̌̋t̟ͭe͌̉ͫ̔d̀̅͑ͬ̈ ̮̬̤̰̘̒c͇͕͊͂o̜͍̼̩d̼̖͍̰͂ͅe̖̮̮͔͓̜ͥͬͩ!͓̮͍̮

&nbsp;

Not really...but SSMS sure makes it look that way...I'll show you how it looks in SSMS first...

![image-20210216172330200](/img/confusingcode/image-20210216172330200.png)

Yeah...there's no way *that* will run...right?

Well...Try it for yourself. The code snippet below and the screenshot above are the exact same string. However, for some reason, SSMS renders this text differently, making it look like the identifiers, strings and comments are in some way "infecting" the rest of the line.

(I recommend triple clicking the snippet to highlight the hole thing, you may miss some of the non-highlightable characters)

```tsql
SELECT [A̸̧̡̨̨̧̢̨̛͉͇̗̣̗͕̘̝͙̦͇̲͔͈͖̮̱̘̩̺̭͈͔̠̩̦̥̞̞͕̬̱̩̹͇̙̤̩̞̜͎̺̦̪̼͖̼̝̟͓̮̗͙̙̳͙̭̙̝̩̥̞̖̘̲̫̻̭̳̱͖͔̲̲͇̜͖̼̱̬͈̼̼̙͙͇̦̳̝̥̺͇̪̾͊͛̾̍̇͑̈́̆̔̇̽̀̅̂̑̐̚͜͜͝͠͠] = LEN(N'Ą̶̨̧̢̨̨̧̨̨̛̛̛̛̛̰͕͙̭̙̝̩̥̞̖̘̲̫̻̭̳̱͖͔̲̲͇̜͖̼̱̬͈̼̼̙͙͇̦̳̝̥̺͇̪͇̞̟͍̜̙͉̬͉͙͓̮̪̣̲̱̠͇̺̥̰̰̘̪̘̠̦̥͕͉͍̯̯͕̹͓̻͓̦̖̲̫͕̪̘̦̖͖̘͚̩́̍͐̔́͛͛̇̈́̆̄̿̉͗̿̍̔̀̆̀͊́̅̑̒̄͑̂̀̂̎̄̇̓̒̈́̾͐̈́̐̇̂̏̽̈͊͆͊͌̌͛̊͌̍̐͒́͑̉̄̎̈̈́̏̏̾͛͐̈́͂̓̆̾̾̓̿̃̽͌̐͆̓͂̀̈̄͂̐̐̉̊͗́̓̀̍͗̓̏̏̐̋̄̀̆̊̈́̈́̓̿̐̓̌̏̔̃̏͊̋̈́̃̈́̀̌͛͑̊̏͒̃͂͒̔̊͒͊́̆͛̓̏̉̅̏̑̉̓́͗̌́̀͂̉͂̑͒̆͂̋͐̾͒̈́̀̽͋̈́͊̃͂͒̉̓̂̉̅̂͌̃̎͛͒͆̋̎̈́͑̉̓̈́̇͋̐͒͑͋̃́̀̉̈́̄͂̍͒͂́̾̔̿͊̓̎̈́́͌͒̅̕͘͘̚̚̚̚̚̚̚͘͘͘͘͘̕͘͘͘͘͘̕̚̕̕̕̚̕̚͜͜͝͠͠͝͠͝͝͝͠͠͠͠͝͝͠͝͝͝͝'), [A̸̧̡̨̨̧̢̨̛͉͇̗̣̗͕̘̝͙̦͇̲͔͈͖̮̱̘̩̺̭͈͔̠̩̦̥̞̞͕̬̱̩̹͇̙̤̩̞̜͎̺̦̪̼͖̼̝̟͓̮̗͙̙̳͙̭̙̝̩̥̞̖̘̲̫̻̭̳̱͖͔̲̲͇̜͖̼̱̬͈̼̼̙͙͇̦̳̝̥̺͇̪̾͊͛̾̍̇͑̈́̆̔̇̽̀̅̂̑̐̚͜͜͝͠͠] = DATALENGTH(N'a̶̧̨̢̧̧̢̢̧̢̨̡̨̧̨̨̛̛̝̩̥͖͖̺̞̣͍͇̬͔̻͍͖̤͕͖͚̺̟͚͔̼͉̪̻̘̼̦͉̠͈̼̱͚̹͍͕̦̼̗͕̼̩̰̼̰͇̪̰͇̠̟̪̞͙̦͉̹̟̞̱͇̞̟͍̜̙͉̬͉͙͓̮̪̣̲̱̠͇̺̥̰̰̘̪̘̠̦̥͕͉͍̯̯͕̹͓̻͓̦̖̲̫͕̪̘̦̖͖̘͚̩̋̄̈̊́̏͂̒̈́̄̈́͌̉̏̾̋̈́̈́̔̒̔̃̽̒̍̑́̈́̒̔̎̒͐̈̂̑̾͒̂̅̔͒̆̌͐͑̓͐̄̂͗̄̈́̈́͒̀́̒̋͑͛̀̓̇̐̈͗̽̀̉̌̆͂̍̽̒̑̓͌̆̄̂̏̎͆̎̍͛̚̕͘͘̕̚̕͘̕͘͜͜͜͜͠͝͝͝͝͠ͅͅ'), [A̸̧̡̨̨̧̢̨̛͉͇̗̣̗͕̘̝͙̦͇̲͔͈͖̮̱̘̩̺̭͈͔̠̩̦̥̞̞͕̬̱̩̹͇̙̤̩̞̜͎̺̦̪̼͖̼̝̟͓̮̗͙̙̳͙̭̙̝̩̥̞̖̘̲̫̻̭̳̱͖͔̲̲͇̜͖̼̱̬͈̼̼̙͙͇̦̳̝̥̺͇̪̾͊͛̾̍̇͑̈́̆̔̇̽̀̅̂̑̐̚͜͜͝͠͠] = N'a̶̧̨̢̧̧̢̢̧̢̨̡̨̧̨̨̛̛̝̩̥͖͖̺̞̣͍͇̬͔̻͍͖̤͕͖͚̺̟͚͔̼͉̪̻̘̼̦͉̠͈̼̱͚̹͍͕̦̼̗͕̼̩̰̼̰͇̪̰͇̠̟̪̞͙̦͉̹̟̞̱͇̞̟͍̜̙͉̬͉͙͓̮̪̣̲̱̠͇̺̥̰̰̘̪̘̠̦̥͕͉͍̯̯͕̹͓̻͓̦̖̲̫͕̪̘̦̖͖̘͚̩̋̄̈̊́̏͂̒̈́̄̈́͌̉̏̾̋̈́̈́̔̒̔̃̽̒̍̑́̈́̒̔̎̒͐̈̂̑̾͒̂̅̔͒̆̌͐͑̓͐̄̂͗̄̈́̈́͒̀́̒̋͑͛̀̓̇̐̈͗̽̀̉̌̆͂̍̽̒̑̓͌̆̄̂̏̎͆̎̍͛̚̕͘͘̕̚̕͘̕͘͜͜͜͜͠͝͝͝͝͠ͅͅ' --a̶̧̨̢̧̧̢̢̧̢̨̡̨̧̨̨̛̛̝̩̥͖͖̺̞̣͍͇̬͔̻͍͖̤͕͖͚̺̟͚͔̼͉̪̻̘̼̦͉̠͈̼̱͚̹͍͕̦̼̗͕̼̩̰̼̰͇̪̰͇̠̟̪̞͙̦͉̹̟̞̱͇̞̟͍̜̙͉̬͉͙͓̮̪̣̲̱̠͇̺̥̰̰̘̪̘̠̦̥͕͉͍̯̯͕̹͓̻͓̦̖̲̫͕̪̘̦̖͖̘͚̩̋̄̈̊́̏͂̒̈́̄̈́͌̉̏̾̋̈́̈́̔̒̔̃̽̒̍̑́̈́̒̔̎̒͐̈̂̑̾͒̂̅̔͒̆̌͐͑̓͐̄̂͗̄̈́̈́͒̀́̒̋͑͛̀̓̇̐̈͗̽̀̉̌̆͂̍̽̒̑̓͌̆̄̂̏̎͆̎̍͛̚̕͘͘̕̚̕͘̕͘͜͜͜͜͠͝͝͝͝͠ͅͅ
```

If you've been on the interwebs long enough, you'll recognize this as "[Zalgo Text](https://en.wikipedia.org/wiki/Combining_character#Zalgo_text){:target="_blank"}". There are generators online for creating this. Unicode allows you to layer multiple diacritics on top of each other. These generators take advantage of that, and layer a whole TON of them onto each character randomly, giving it this crazy look. [Here's the generator I used for this demo](https://zalgo.org){:target="_blank"}.

Oh, by the way....this also works for naming databases, columns, tables, schemas, etc. However, you'll run into the max length limit fairly quickly.

----

### Shorten your code by not using spaces

Don't you just hate hitting your space bar? It's such a hassle. You probably wish you could skip spaces altogether.

The other day in the SQL Community slack channel, we we're chatting about code golf. You are given a coding challenge and whoever can write the shortest code while achieving the goal, wins....

The goal was to write a piece of code that will generate a tree...like so...

If N=3 then the result should be:

```plaintext
   *
  ***
 *****
   *
```

Here's what I came up with...

```tsql
DECLARE​@​int=5;
WITH​a​AS(SELECT​x​FROM(VALUES(1),(1),(1),(1),(1))x(x))
SELECT​TOP(@+1)IIF(r-@=1,SPACE(@)+'*',SPACE(@-r+1)+REPLICATE('*',r*2-1))
FROM(SELECT​r=ROW_NUMBER()OVER(ORDER​BY​1/0)FROM​a,a​b,a​c,a​d)b
```

You may have noticed I also used a few tricks that were mentioned earlier as well...Things like `@` for the variable name, and `ORDER BY 1/0` for the window function. I also used old style cross joins (🤮).

You can copy this into SSMS and run it...change the value of the variable to whatever you want, and it will generate a nice little tree. We had even joked about adding ornaments to it using the zalgo text above 😂.

Okay....so did you figure out how this is able to run, despite not having spaces? It's weird stuff right?

Okay, here's the secret...Zero Width Spaces. Yup...there's many different types of spaces, you've likely even used some of them...like `&nbsp;`...That's a non-breaking space. There's also an em space, en space, thin space, hair space...aaaanndd...a zero width space, which, you guessed it...it's basically invisible. Here's one right here (&#8203;). You can do some cool things with these....I use them on Facebook posts to add full height line breaks. There's also [this cool link shortening website](https://zws.im/){:target="_blank"} which uses them to generate seemingly identical links which go to different locations.

Full disclosure though...I don't think this trick would gain you any points in code golf, as it's still a character, you just can't see it...so it's kind of cheating 😢

----

### SQL Server loves consistency

Especially when it comes to semi-colons, right? Oh, wait...

Well...At least they're consistent about commas...

```tsql
CREATE TABLE #Commas (
    SomeColumn int NOT NULL,
    SomeOtherColumn varchar(10) NULL,
);
```

That's right, DDL statements support trailing commas.

In their defense though, I'm in support of trailing commas for most things. It makes it easier to diff changes, or change the order of things, so I'm okay with this one. I have confused a few people with my scripts though...it's occasionally spotted as a "typo".

----

### String values don't always need quotes

```tsql
CREATE OR ALTER PROCEDURE #usp_TestProc (
    @string varchar(100)
)
AS
BEGIN;
    SELECT @string;
END;
GO
EXEC #usp_TestProc @string = This_Is_A_Test
```

As long as the value follows the rules of an object identifier, like a table or proc name, then it technically doesn't need to be put in single quotes. I actually mentioned this trick in a previous blog post where you can use it to build some interesting [SSMS keyboard query shortcuts]({% post_url 2021-01-21-ssms-keyboard-query-shortcuts %}){:target="_blank"}. However, in practice, you should always qualify your strings with single quotes for clarity.

----

There's plenty more of these, but these are the most interesting/fun ones that I wanted to share.

What are some fun "there's no way that will run" snippets you have? Maybe one of these days, I'll write a Part 2.
