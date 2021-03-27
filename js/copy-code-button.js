// Source: https://www.dannyguo.com/blog/how-to-add-copy-to-clipboard-buttons-to-code-blocks-in-hugo/
function addCopyButtons(clipboard) {
    document.querySelectorAll('pre > code').forEach(function (codeBlock) {
        var button = document.createElement('button');
        button.className = 'copy-code-button';
        button.type = 'button';
        button.innerText = 'Copy';
        button.addEventListener('click', function () {
            clipboard.writeText(codeBlock.innerText).then(function () {
                button.blur();
                button.innerText = 'Copied!';
                setTimeout(function () {button.innerText = 'Copy';}, 2000);
            }, function (error) {button.innerText = 'Error';});
        });
        var pre = codeBlock.parentNode;
        pre.parentNode.insertBefore(button, pre);
    });
}

addCopyButtons(navigator.clipboard);