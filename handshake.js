function receiveMessage(e) {
    console.log('receiveMessage %o', e);
    // send message to main window with da app
    window.opener.postMessage(
        'authorization:github:success:{"token":${token},"provider":"github"}',
        e.origin
    );
}
window.addEventListener('message', receiveMessage, false);
// Start handshare with parent
console.log(window.opener);
console.log('Sending message: %o', 'github');
window.opener.postMessage('authorizing:github', '*');
