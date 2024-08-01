---
layout: post
title: "PowerShell Common Parameters: PipelineVariable"
description: "TIL about the -PipelineVariable common parameter in PowerShell. All the pain I've put myself through to fix pipeline scope issues, when I could have just been using this!?"
date: 2021-05-24T18:30:00-07:00
tags: PowerShell
image: /img/postbanners/2021-05-24-powershell-pipelinevariable.png
---

PowerShell has been a daily tool for me for at least 5 or 6 years at this point, so when I learn something new that seems fairly useful I figure it's probably worth writing about. These posts also help me remember because they force me to do more research into it than I normally would.

TIL (Today I Learned) about the `-PipelineVariable` parameter in PowerShell, known as a "Common Parameter"; which are automatically added by PowerShell to cmdlets that are decorated with the [`[cmdletbinding()]`](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_functions_cmdletbindingattribute){:target="_blank"} attribute.

This is by no means a "new" feature, `-PipelineVariable` was [added as a common parameter in 2017 for version v4.0](https://docs.microsoft.com/en-us/powershell/scripting/windows-powershell/whats-new/what-s-new-in-windows-powershell-50?view=powershell-7.1#new-features-in-windows-powershell-40#:~:text=PipelineVariable){:target="_blank"}.

----

### What problem does it fix?

One problem with pipelines is scope limitations. Here's what I mean:

```powershell
'a','b','c' | ForEach-Object { 1, 2, 3 } | ForEach-Object { $_ }
```

Say we wanted to return the cartesian product of `$letters` x `$numbers`...like `a1, a2, a3, b1, b2, b3, [...]`. How would you do this using pipelines? Without the use of `-PipelineVariable`, you can't, at least not in an obvious direct way. The final `ForEach-Object` has no visibility to the original array of letters we first passed in, the only thing it can see is the array of numbers.

Prior to today, I would have converted it from using the `ForEach-Object` cmdlet to using the `foreach` statement. This allows you to create variables at each level, and then those variables are accessible from all child scopes. Like so:

```powershell
foreach ($letter in 'a','b','c') {
    foreach ($number in 1, 2, 3) {
        Write-Output "${letter}${number}"
    }
}
```

There's nothing wrong with building it this way. In my opinion, if you were building a script that is meant to go out to production, this is probably the way I would go. It's easier to read and understand and it's formatted nicely.

The problem is that you don't _always_ have the ability to structure your code this way. Sometimes you need to work with things in the pipeline, or you're writing a quick one off script in the terminal and you don't need to worry about formality.

----

### Basic usage

To fix this issue `-PipelineVariable` was added. It allows you to create variables that are accessible in child scopes further down the pipeline.

So how would we recreate that `foreach` example above into using pipelines?

This is how it would look:

```powershell
'a','b','c' | % -PV letter { $_ } | % -PV number { 1, 2, 3 } | % { write "${letter}${number}" }
```

Now...I agree, it's ugly, it's not easy to read, especially when using all of the aliases and syntax shortcuts. But, it's certainly a useful trick and I've already used it a few times since I originally drafted this post.

----

### Let's break down what's happening here...

First we want to assign the `$letter` variable...

```powershell
'a','b','c' | ForEach-Object -PipelineVariable letter { $_ }
```

Which means... iterate through `'a','b','c'`. Every time a new "thing" is returned, assign it to `$letter`. Note that the variable name does not include the leading `$`. This is the equivalent of the following:

```powershell
foreach ($letter in 'a','b','c') {
}
```

----

Then we need to add in the numbers array and the `$number` variable...

```powershell
'a','b','c' | ForEach-Object -PipelineVariable letter { $_ } |
    ForEach-Object -PipelineVariable number { 1,2,3 }
```

Which is now the equivalent of the following:

```powershell
foreach ($letter in 'a','b','c') {
    foreach ($number in 1,2,3) {
    }
}
```

----

And finally, we want to generate our output:

```powershell
'a','b','c' | ForEach-Object -PipelineVariable letter { $_ } |
    ForEach-Object -PipelineVariable number { 1,2,3 } |
        ForEach-Object {
            Write-Output "${letter}${number}"
        }
```

Which is the equivalent of our original `foreach` example:

```powershell
foreach ($letter in 'a','b','c') {
    foreach ($number in 1,2,3) {
        Write-Output "${letter}${number}"
    }
}
```

----

You're probably looking at those last two code snippets and thinking the `-PipelineVariable` method is _way_ uglier than just using `foreach`, and I would agree with you. Like I said earlier, if I were building a nice, polished production script, I likely wouldn't build it using pipelines if I didn't have to.

However, when I'm working from the terminal trying to quickly solve a problem, I use aliases and short-hand.

So, if I were writing this as a quick one-off command in the terminal, I'd build it this way:

```powershell
'a','b','c' | % -PV letter { $_ } | % -PV number { 1,2,3 } | % { write "${letter}${number}" }
```

\* `-PV` is shorthand for `-PipelineVariable`

The reason I like this over using `foreach` is because I'm a fan of using pipelines where you don't have to deal with nesting things, or keeping track of brackets or parenthesis. This method allows you to write everything in a single continuous line, using only pipes.

----

### Advanced: Create a function that supports `-PipelineVariable`

This is more of an advanced section, but if you're curious, keep reading.

You might be wondering how you would create a function that is able to use this common parameter. Well...You can't...I mean, you can, but it won't work correctly because there's a bug in PowerShell that causes `-PipelineVariable` to be assigned to just once. However, [this was fixed with version 7.2.0 of PowerShell Core](https://github.com/PowerShell/PowerShell/pull/12766){:target="_blank"}.

So if you want to do this, you can either wait for 7.2.0 to be fully released, or you can download a 7.2.0 preview release.

For the sake of this post, I went ahead and installed the latest and greatest 7.2.0-preview.5.

Here's an example of implementing `-PipelineVariable`:

```powershell
function Invoke-AddOne {
    param (
        [Parameter(ValueFromPipeline)]
        [string[]]$Number
    )

    Process {
        $_ + 1
    }
}
```

The key here is the explicit use of the `Process` block. Remember that if you define a function and you don't specify a `Begin`/`Process`/`End` block, then PowerShell defaults to using the `End` block. Both the `Begin` and `End` blocks are only executed once, but the `Process` block is executed for each pipeline value.

First lets test the function:

```powershell
PS> 1,2,3 | Invoke-AddOne
2
3
4
```

Looks good, we passed in 1,2,3 and got back 2,3,4.

Now, lets test using `-PipelineVariable`

```powershell
PS> 1,2,3 | Invoke-AddOne -PV test | % { $test }
2
3
4
```

Woohoo! It works.

----

### Bonus tip

In the course of writing this post, I came across an interesting [tip from someone on Reddit](https://www.reddit.com/r/PowerShell/comments/dvf4sf/pipeline_variable_is_awseome/){:target="_blank"}.

If a cmdlet you are trying to use does not support the `-PipelineVariable` parameter, you can get around this by passing it through `Where-Object` (`?`).

Example, let's say our `Invoke-AddOne` function we made doesn't support `-PipelineVariable`:

```powershell
1,2,3 | Invoke-AddOne | ? { $true } -PV test | % { $test }
```

This works because we're passing all of the pipeline values through `Where-Object` with a filter of `$true` which means nothing gets filtered out, and it gets assigned to our `$test` pipeline variable to be used down the line.
