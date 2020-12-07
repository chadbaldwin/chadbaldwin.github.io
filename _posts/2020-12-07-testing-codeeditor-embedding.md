# Testing code editor embedding

Embedding codepen.io

<p class="codepen" data-height="265" data-theme-id="light" data-default-tab="html,result" data-user="chadbaldwin" data-slug-hash="JjKQbMw" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="JjKQbMw">
  <span>See the Pen <a href="https://codepen.io/chadbaldwin/pen/JjKQbMw">JjKQbMw</a> by Chad (<a href="https://codepen.io/chadbaldwin">@chadbaldwin</a>) on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<br />
Embedding ace editor locally:
<style type="text/css" media="screen">
  #editor { 
      position: absolute;
      top: 0; right: 0; bottom: 0; left: 0;
  }
</style>
<pre id="ace_editor" style="height: 224px;" class="ace_editor ace-tm">
  <div id="editor">function foo(items) {
      var x = "All this is syntax highlighted";
      return x;
  }</div>
</pre>

<script src="/js/src-min-noconflict/ace.js" type="text/javascript" charset="utf-8"></script>
<script>var editor = ace.edit("editor"); editor.setTheme("ace/theme/TextMate"); editor.session.setMode("ace/mode/javascript");</script>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>
