module("luci.controller.rpc", package.seeall)

function index()
    entry({"rpc", "getTempInfo"}, call("getTempInfo"), nil).leaf = true
end

function getTempInfo()
    local temp = luci.sys.exec("cat /sys/class/thermal/thermal_zone0/temp")
    local value = tonumber(temp) or 0
    value = string.format("%.1f °C", value / 1000)
    luci.http.prepare_content("application/json")
    luci.http.write_json({ tempinfo = value })
end
