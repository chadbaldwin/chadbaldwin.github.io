Testing markdown rendering for code snippets.

This is a jekyll codeblock for sql:
{% highlight sql linedivs %}
SELECT *
FROM sys.objects o
WHERE o.[name] = 'foobar'
    AND o.[type] = 'P'
ORDER BY o.[object_id]
{% endhighlight %}

This is a standard fenced markdown code block
```sql
SELECT *
FROM sys.objects o
WHERE o.[name] = 'foobar'
    AND o.[type] = 'P'
ORDER BY o.[object_id]
```

This is a code block using the embedded ace editor:
<style>.ace_editor { border: 1px solid lightgray; width: 60%; }</style>
<pre id="editor">
SELECT *
FROM AutoAlert.dbo.Dealer d
WHERE d.[Enabled] = 1
    AND d.DealerCode = 'FMDEMO'</pre>
<script src="../js/src-min-noconflict/ace.js"></script>
<script>ace.edit("editor", {theme: "ace/theme/TextMate", mode: "ace/mode/sql", maxLines: 20});</script>