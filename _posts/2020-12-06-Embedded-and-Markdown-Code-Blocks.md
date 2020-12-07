Testing markdown rendering for code snippets.

This is a jekyll codeblock for sql:

{% highlight sql linedivs %}
SELECT *, OBJECT_NAME(o.[object_id])
FROM sys.objects o
WHERE o.[name] = 'foobar'
    AND o.[type] = 'P'
ORDER BY o.[object_id]
{% endhighlight %}

This is a standard fenced markdown code block

```sql
SELECT *, OBJECT_NAME(o.[object_id])
FROM sys.objects o
WHERE o.[name] = 'foobar'
    AND o.[type] = 'P'
ORDER BY o.[object_id]
```

This is a code block using the embedded ace editor:

<style>.ace_editor { border: 1px solid lightgray; }</style>
<pre id="editor">
SELECT *, OBJECT_NAME(o.[object_id])
FROM sys.objects o
WHERE o.[name] = 'foobar'
    AND o.[type] = 'P'
ORDER BY o.[object_id]</pre>
<script src="/js/src-min-noconflict/ace.js"></script>
<script>ace.edit("editor", {mode: "ace/mode/sqlserver", theme: "ace/theme/sqlserver", maxLines: 20, readOnly: true});</script>