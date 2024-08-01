---
layout: post
title: Certifications and learning
description: I recently earned my MCSA certification. Here's a bit about my opinion of certifications.
date: 2021-01-31 10:40:00 -0800
tags: Misc
---

![Funny GIF of a hippo eating a watermelon](https://media.giphy.com/media/12YWqHikTndSRG/giphy.gif){:alt="drawing" style="width:200px; float:right;"}If you're anything like me...learning is hard...like...really hard. I have ADHD which makes learning new things a bit of a challenge. Watching a technical video on YouTube, attending an online class, following a Pluralsight course, all are next to impossible most of the time. I *can* do it...but it takes me multiple attempts to *really* retain the information. YouTube tutorials turn into hours long spelunking adventures. I go from watching a video on tuning indexes, to watching someone feeding watermelons to a hippo.

I'm pretty sure I've started watching the same "Getting started with Python" Pluralsight course *at least* half a dozen times. I've been paying for a Pluralsight membership for *years* and I rarely use it, but I don't dare cancel it because I *think* I'll use it.

The only way I'm able to effectively learn something is through hands-on actual job experience. Give me the task, and I will do whatever it takes to figure it out and get it done. I learned SQL, PowerShell and now C# on the job, among many other things. The reason? Because now someone else is relying on me to get something done; And that's just enough pressure to keep me focused on the task. So if all it takes for me to learn something is to apply a bit of pressure...what's another option for independent learning?

----

### Certifications

A few weeks ago, [Brent Ozar blogged about certifications](https://www.brentozar.com/archive/2021/01/which-microsoft-certification-should-you-get/){:target="_blank"}. Reading it encouraged me to look into what Microsoft offered. Due to the COVID-19 pandemic, like many others, I've been stuck at home on top of already having a work from home job. So I might as well do something productive with all of this free time I have.

I started researching into the [Microsoft certifications](https://docs.microsoft.com/en-us/learn/certifications/){:target="_blank"} to see what certs best fit my current career path. To my surprise, I found that the certification I was interested in &mdash; [MCSA: SQL 2016 Database Development](https://docs.microsoft.com/en-us/learn/certifications/mcsa-sql2016-database-development-certification){:target="_blank"} &mdash; was going to be retired on Jan 31st 2021 and at the time, it was Jan 12th...19 days to take and pass two exams (70-761, 70-762). Not only that...but this would be my ONLY chance to ever take them, after that, they'll be retired, no re-takes. **But** one of the things Brent mentioned in his blog post was "No matter why you want the exam, just take it first.". So...that's what I decided to do, win or lose.

The exams were $165 each. I figured worst case scenario, I fail both exams, I'm out $330...but I still learn a **ton** in the course of preparing for the exams.

----

### Exam #1 - 70-761: Querying Data with Transact-SQL

The first exam (70-761) I scheduled for Jan 18th, giving me about 6 days to prepare. This exam covered T-SQL development, which at this point I've been doing for nearly 9 years and I'm pretty confident with with the language. The only things I really needed to study was handling XML/JSON, querying temporal tables, triggers and basically anything new in 2016 since my job experience was primarily with SQL Server 2014.

To study, I downloaded the "skills measured" PDF provided by Microsoft, broke it up into bullet points and highlighted each bullet in red, yellow, green depending on my level of confidence. I studied in depth the yellows and reds and only touched on the greens.

A huge help to me was [this blog post](https://mika-s.github.io/sql/certification/70-761/2019/05/27/notes-on-70-761-Querying-Data-with-Transact-SQL){:target="_blank"} which covers the entire 70-761 exam reference book with nice copy/paste demos. Even though the exam is now retired, this is still a wonderful reference for learning SQL and huge credit to Mika for the work they put into this (unfortunately, they have no social media information on their website or GitHub, so I can't give them more credit than this).

Exam day came...and to keep it short...I passed!! And the effort I put into studying definitely helped.

----

### Exam #2 - 70-762: Developing SQL Databases

Now that I passed the first exam, I could focus on the second exam. My exam was scheduled for Jan 29th, which gave me 11 days to prepare. This exam, however, I was not nearly as confident taking. All of my work experience was on development...not DBA type work, and this exam covered a lot of areas I knew nothing about. Optimistically, I'd say my experience covered about 30% of the "skills measured" PDF.

Things I knew nothing about prior to this exam: monitoring, extended events, Azure, Resource Governor, columnstore indexes, in-memory OLTP, index maintenance, troubleshooting with system DMVs....Let's just say I had a lot to cover.

I knew in order to have a chance at passing at this exam, I was going to need to put in a lot more work. I ordered the [official 70-762 Exam reference](https://amzn.to/35Re73h){:target="_blank"} from Amazon. It's 368 pages and was expected to arrive in 2 days, giving me 10 days to read it at about 37 pages a day.

While waiting for the book to be delivered, I used that time to read about in-memory OLTP tables, natively compiled stored procedures and columnstore indexes in [Itzik Ben-Gan's book "T-SQL Querying"](https://amzn.to/39BLMzk){:target="_blank"} which I happened to have already. Those are two HUGE "new" things with SQL Server and I had a feeling they would be heavily covered on the exam and that I would need to focus on those areas a lot.

I read and finished the book with 1 day to spare. I read the exam book every morning before work, I used my lunch breaks to watch YouTube videos, and after work I either read the book or I read blog posts, documentation, etc.

Exam day came and I was literally watching YouTube videos on columnstore indexes and in-memory OLTP set to 2X speed minutes before my exam trying to absorb as much information as I possibly could.

But...my studying paid off and I passed! Thus earning my MCSA! My first certification. 🎉

----

### My take from all of this

Prior to a few weeks ago, I had no intention of getting a certification. I never really saw a lot of value in them. Maybe I'm just influenced by past experiences or by the people I've met.

However, this opinion has changed quite a bit in the last few weeks. While I still don't know how much the certification itself will benefit me career-wise...it certainly benefitted me knowledge-wise. I've learned more about SQL Server in the last 3 weeks than I have in the past 3 years, all because I put some money on the line, scheduled an exam and gave myself that pressure I needed to focus and study for a specific goal.

If you read this, and you can relate to it...maybe you should give a certification a shot. Find a certification you're interested in, buy some books, sign up for Pluralsight, find some good YouTube videos, schedule the exam and give it a shot. You never know. Chances are, you're underestimating yourself. Even if you don't pass...now you'll know what you need to study before you take it again. And you never know...you may even be able to get your work to pay for your exam/study materials.
