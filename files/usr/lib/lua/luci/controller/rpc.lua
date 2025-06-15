module("luci.controller.rpc", package.seeall)

function index()
    entry({"rpc", "getCPUUsage"}, call("getCPUUsage"), nil).leaf = true
    entry({"rpc", "getTempInfo"}, call("getTempInfo"), nil).leaf = true
end

function getCPUUsage()
    local usage = luci.sys.exec("top -bn1 | grep -m1 'CPU:' | awk '{print $2}'")
    usage = usage:match("%d+%%") or "0%"
    luci.http.prepare_content("application/json")
    luci.http.write_json({ cpuusage = usage })
end

function getTempInfo()
    local temp = luci.sys.exec("cat /sys/class/thermal/thermal_zone0/temp")
    local value = tonumber(temp) or 0
    value = string.format("%.1f °C", value / 1000)
    luci.http.prepare_content("application/json")
    luci.http.write_json({ tempinfo = value })
end
