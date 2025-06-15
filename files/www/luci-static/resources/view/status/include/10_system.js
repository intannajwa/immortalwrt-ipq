
'use strict';
'require baseclass';
'require fs';
'require rpc';

var callLuciVersion = rpc.declare({
    object: 'luci',
    method: 'getVersion'
});

var callSystemBoard = rpc.declare({
    object: 'system',
    method: 'board'
});

var callSystemInfo = rpc.declare({
    object: 'system',
    method: 'info'
});

var callCPUBench = rpc.declare({
    object: 'luci',
    method: 'getCPUBench'
});

var callCPUInfo = rpc.declare({
    object: 'luci',
    method: 'getCPUInfo'
});

function callCPUUsage() {
    return L.Request.get(L.url('rpc', 'getCPUUsage')).then(function(res) {
        return res.json();
    });
}

function callTempInfo() {
    return L.Request.get(L.url('rpc', 'getTempInfo')).then(function(res) {
        return res.json();
    });
}

return baseclass.extend({
    title: _('System'),

    load: function () {
        return Promise.all([
            L.resolveDefault(callSystemBoard(), {}),
            L.resolveDefault(callSystemInfo(), {}),
            L.resolveDefault(callCPUBench(), {}),
            L.resolveDefault(callCPUInfo(), {}),
            callCPUUsage(),
            callTempInfo(),
            L.resolveDefault(callLuciVersion(), {
                revision: _('unknown version'),
                branch: 'LuCI'
            })
        ]);
    },

    render: function (data) {
        var boardinfo = data[0],
            systeminfo = data[1],
            cpubench = data[2],
            cpuinfo = data[3],
            cpuusage = data[4],
            tempinfo = data[5],
            luciversion = data[6];

        luciversion = luciversion.branch + ' ' + luciversion.revision;

        var datestr = null;
        if (systeminfo.localtime) {
            var date = new Date(systeminfo.localtime * 1000);
            datestr = '%04d-%02d-%02d %02d:%02d:%02d'.format(
                date.getUTCFullYear(),
                date.getUTCMonth() + 1,
                date.getUTCDate(),
                date.getUTCHours(),
                date.getUTCMinutes(),
                date.getUTCSeconds()
            );
        }

        var fields = [
            _('Firmware'), 'DOTYWRT V1.2.B3 - NSS',
            _('Model'), boardinfo.model,
            _('Version'), (L.isObject(boardinfo.release) ? boardinfo.release.description : ''),
            _('Kernel'), boardinfo.kernel,
            _('Time'), datestr,
            _('Uptime'), systeminfo.uptime ? '%t'.format(systeminfo.uptime) : null,
            _('CPU Stat'), 
                ((cpuusage && cpuusage.cpuusage) ? cpuusage.cpuusage : 'N/A') + ' / ' + 
                ((tempinfo && tempinfo.tempinfo) ? tempinfo.tempinfo : 'N/A')
        ];

        var table = E('table', { 'class': 'table' });

        for (var i = 0; i < fields.length; i += 2) {
            table.appendChild(E('tr', { 'class': 'tr' }, [
                E('td', { 'class': 'td left', 'width': '33%' }, [fields[i]]),
                E('td', { 'class': 'td left' }, [(fields[i + 1] != null) ? fields[i + 1] : '?'])
            ]));
        }

        return table;
    }
});
