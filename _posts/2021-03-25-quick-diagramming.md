---
layout: post
title: Building diagrams using graphviz
description: You're tracing through a bunch of code, and you want to quickly visualize the dependency chain? Check out tools like Graphviz.
date: 2021-03-25 21:00:00 -0700
tags: Quick-Post
image: /img/postbanners/2021-03-25-quick-diagramming.png
---

Today I was tracing through a chain of SQL stored procedures, tables, views, jobs, windows services, etc. I was beginning to forget which things were calling other things. It spanned multiple databases on multiple servers.

To get a better idea of what I was looking at I decided to throw together a quick visual diagram. This is something I do a lot when I'm tracing through code, or if I'm trying to work out a very basic structure of how something should work. There's tons of ways to do this...pen and paper, notepad, flowchart/diagramming software including both paid and free ones. There's also tons of websites that offer tools for this.

> Warning: For any graphviz experts reading, I might get some terminology wrong here. I tried googling around, but it was hard to tell if "DOT" the language was different from "dot" the rendering layout engine (similar to neato, fdp, twopi).

My personal favorite is called DOT, which is a graph description language. Along with DOT, I use Graphviz, which is a library of programs for converting the DOT code into the visual graph.

This might sound intimidating, and I thought so too at first, but it's relatively simple. There's nothing to install on your computer (if you don't want to) and it's very easy to get started.

----

Let's start off with a simple example:

```dot
digraph G {
    thing1 -> thing2
}
```

That code will generate this chart:

![download](/img/quickgraphviz/simple.png)

That's it. I told you it was simple (I'll show you how to convert the code into a chart a little later).

Now, let's take it up one more level...

```dot
digraph G {
    thing1 -> thing2
    thing1 -> thing3
    
    thing3 -> thing4
}
```

![simple2](/img/quickgraphviz/simple2.png)

As far as throwing together simple dependency charts go...that's it. The reason I love this so much is because if all you care about is generating a chart, then this is great. You don't have to worry about spacing, dragging arrows or boxes around, setting up labels, etc. All you have to worry about is the entities (thing1, thing2) and the relationships (using `->` to say who points at who).

Of course, there is a whole world beyond this. Once you gain more experience with it, you can set up groups, change the shapes, line color, fill color, labels, and more. But, just knowing these basics alone are enough to get most things done.

----

Now that you know the basics, let's show a relatable example.

Say you're quickly running through a process, it starts with a job which calls a proc, and then that proc calls another proc and while also logging to a table.

```dot
digraph G {
    # entities can be defined separate from the relationships
    job_someJob [label="Job that runs the first proc"]

    # its generally a good idea to define your entities first
    # rather than in the relationship for clarity
    job_SomeJob -> usp_StoredProcedure1
    usp_StoredProcedure1 -> usp_StoredProcedure2
    usp_StoredProcedure1 -> log_to_table1
}
```

![relate](/img/quickgraphviz/relate.png)

Here, I've thrown in a label so that it's a bit more readable.

----

If you want to play around with this a bit more, there is a TON of information online, but I just wanted to give a quick run through. There's a lot of benefits to using a language like this over something like a graphing tool, for example, this could be checked into source control, and changes tracked.

If you want to learn more about Graphviz and the DOT language, you can check out their website:

* <https://graphviz.org>{:target="_blank"}

To convert the code into a visual graph, you can use an online renderer (just copy paste any of the examples here, and it will render live):

* <https://dreampuf.github.io/GraphvizOnline>{:target="_blank"}
* <http://viz-js.com>{:target="_blank"}

If you use Visual Studio Code, there are some extensions that work quite well. One of them is a live preview, similar to the web based options above, the other enhances the markdown preview to render inline graphs.

* <https://marketplace.visualstudio.com/items?itemName=joaompinto.vscode-graphviz>{:target="_blank"}
* <https://marketplace.visualstudio.com/items?itemName=geeklearningio.graphviz-markdown-preview>{:target="_blank"}

Outside of Graphviz, there are other sites which also use graph description languages similar to DOT...These other sites are nice because you can build other types of charts that you can't do with Graphviz, like a sequence diagram.

* <https://www.websequencediagrams.com>{:target="_blank"}
* <https://www.diagram.codes>{:target="_blank"}

----

Using this tool isn't limited to just visualizing SQL. I've used this to create charts to document simple workflows, apps I'm working with, my home network. It even comes in handy if you're trying to describe something to someone via instant message and you need to throw a quick chart together.

----

For fun, here's the chart I threw together today, using nested groups, different types of lines, colors, shapes, etc.

Most of this wasn't really necessary, but in the process, I wanted to learn more about using nested groups (called clusters).

![final](/img/quickgraphviz/final.png)

```dot
digraph G {
    subgraph cluster_Services {
        label="Services"
        
        app_foobar [shape=Mrecord, label="{Foobar Repo|.Net App}"]
    }

    subgraph cluster_Server1 {
        label="Server1"

        subgraph cluster_Jobs {
            label="Jobs"

            job_daily
                [shape=Mrecord, label="{Job) Daily Job|Step 2) Run stored proc}"]
        }
    }

    subgraph cluster_Server2 {
        label="Server2"

        subgraph cluster_Support_Database {
            label="Support_Database"
            
            subgraph cluster_Procs {
                label="Procs"

                usp_StoredProcedure1
                usp_StoredProcedure2
            }
            
            subgraph cluster_Tables {
                label="Tables"
            
                Table1, Table2, Table3, Table4
            }
            
            subgraph cluster_Views {
                label="Views"

                vw_View1
            }
        }
    }
    
    subgraph cluster_Server3 {
        label="Server3"
        
        subgraph cluster_AutoAlert_Support {
            label="Other_Database"
            
            subgraph cluster_Procs {
                label="Procs"
        
                usp_StoredProcedure3
                usp_StoredProcedure4
            }
        }
    }
    
    subgraph cluster_Reports {
        label="Report Server"
        
        ssrs_report_1 [shape=Mrecord, label="{SSRS Report 1|ReportFile1.rdl}"]
        ssrs_report_2 [shape=Mrecord, label="{SSRS Report 2|ReportFile2.rdl}"]
    }

    app_foobar -> usp_StoredProcedure1
    
    usp_StoredProcedure1 -> Table1, Table2, Table3

    usp_StoredProcedure2 -> Table4
    usp_StoredProcedure2 -> Table3 [color=red]

    job_daily -> usp_StoredProcedure2
    
    ssrs_report_1 -> usp_StoredProcedure3
    ssrs_report_2 -> usp_StoredProcedure4

    usp_StoredProcedure3, usp_StoredProcedure4 -> vw_View1 [style=dashed]
    
    vw_View1 -> Table1, Table2, Table3 [style=dashed]
}
```
