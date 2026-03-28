/**
 * script.js
 * Interactive state machine for the NSB Bridge Diagram
 */

document.addEventListener('DOMContentLoaded', () => {

    const btnSend = document.getElementById('btn-send');
    const btnReceive = document.getElementById('btn-receive');
    const btnFetch = document.getElementById('btn-fetch');
    const btnPost = document.getElementById('btn-post');
    const btnReset = document.getElementById('btn-reset');

    const txCountEl = document.getElementById('tx-count');
    const rxCountEl = document.getElementById('rx-count');
    const terminal = document.getElementById('terminal-log');

    const packet1 = document.getElementById('packet-1'); // App -> Daemon
    const packet2 = document.getElementById('packet-2'); // Daemon -> Sim
    const packet3 = document.getElementById('packet-3'); // Sim -> Daemon
    const packet4 = document.getElementById('packet-4'); // Daemon -> App

    let txQueue = 0;
    let rxQueue = 0;

    function logToTerminal(msg) {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        const div = document.createElement('div');
        div.textContent = `[${time}] ${msg}`;
        terminal.appendChild(div);
        terminal.scrollTop = terminal.scrollHeight;
    }

    // Step 1: App sends payload
    btnSend.addEventListener('click', () => {
        btnSend.classList.add('disabled');
        btnSend.disabled = true;

        logToTerminal("APP_CLIENT: Sending payload 'Hello World' to destination...");
        
        packet1.classList.remove('anim-right');
        void packet1.offsetWidth; // trigger reflow
        packet1.classList.add('anim-right');

        setTimeout(() => {
            txQueue++;
            txCountEl.textContent = txQueue;
            logToTerminal(`DAEMON: Handled SEND message. TX Queue: ${txQueue}`);
            
            // Re-enable send, enable fetch
            btnSend.classList.remove('disabled');
            btnSend.disabled = false;
            btnFetch.classList.remove('disabled');
            btnFetch.disabled = false;
        }, 600);
    });

    // Step 2: Sim fetches payload
    btnFetch.addEventListener('click', () => {
        if (txQueue === 0) return;

        btnFetch.classList.add('disabled');
        btnFetch.disabled = true;

        logToTerminal(`SIM_CLIENT: Calling FETCH()...`);
        txQueue--;
        txCountEl.textContent = txQueue;

        packet2.classList.remove('anim-right');
        void packet2.offsetWidth;
        packet2.classList.add('anim-right');

        setTimeout(() => {
            logToTerminal(`SIM_CLIENT: Fetched payload 'Hello World'. Simulating...`);
            
            // Enable POST
            btnPost.classList.remove('disabled');
            btnPost.disabled = false;
        }, 600);
    });

    // Step 3: Sim posts result
    btnPost.addEventListener('click', () => {
        btnPost.classList.add('disabled');
        btnPost.disabled = true;

        logToTerminal(`SIM_CLIENT: Routing finished. Calling POST()...`);

        packet3.classList.remove('anim-left');
        void packet3.offsetWidth;
        packet3.classList.add('anim-left');

        setTimeout(() => {
            rxQueue++;
            rxCountEl.textContent = rxQueue;
            logToTerminal(`DAEMON: Handled POST message. RX Queue: ${rxQueue}`);
            
            // Enable Receive
            btnReceive.classList.remove('disabled');
            btnReceive.disabled = false;
        }, 600);
    });

    // Step 4: App receives message
    btnReceive.addEventListener('click', () => {
        if (rxQueue === 0) return;

        btnReceive.classList.add('disabled');
        btnReceive.disabled = true;

        logToTerminal(`APP_CLIENT: Calling RECEIVE()...`);
        rxQueue--;
        rxCountEl.textContent = rxQueue;

        packet4.classList.remove('anim-left');
        void packet4.offsetWidth;
        packet4.classList.add('anim-left');

        setTimeout(() => {
            logToTerminal(`APP_CLIENT: Received successfully delivered routed payload.`);
        }, 600);
    });

    // Step 5: Reset Simulator
    btnReset.addEventListener('click', () => {
        // Reset state
        txQueue = 0;
        rxQueue = 0;
        txCountEl.textContent = '0';
        rxCountEl.textContent = '0';

        // Clear terminal but keep start logs
        terminal.innerHTML = `<div>[00:00:00] NSBDaemon started on port 65432.</div>
                              <div>[00:00:00] Listening for client operations...</div>`;

        // Reset Buttons
        btnSend.classList.remove('disabled');
        btnSend.disabled = false;
        btnFetch.classList.add('disabled');
        btnFetch.disabled = true;
        btnPost.classList.add('disabled');
        btnPost.disabled = true;
        btnReceive.classList.add('disabled');
        btnReceive.disabled = true;

        // Reset animations
        [packet1, packet2, packet3, packet4].forEach(p => {
            p.classList.remove('anim-right', 'anim-left');
        });

        logToTerminal(`DAEMON: Simulator state reset. Matrices cleared.`);
    });

});
