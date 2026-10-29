import Foundation
import Capacitor
import WidgetKit

/* Jembatan dari web (js/lib/widgetdata.js) ke widget iPhone. Data disimpan di App Group agar bisa dibaca ekstensi widget. */
@objc(KLWidgetPlugin)
public class KLWidgetPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "KLWidgetPlugin"
    public let jsName = "KLWidget"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setData", returnType: CAPPluginReturnPromise)
    ]

    @objc func setData(_ call: CAPPluginCall) {
        let json = call.getString("json") ?? ""
        UserDefaults(suiteName: KLWidgetShared.group)?.set(json, forKey: KLWidgetShared.key)
        WidgetCenter.shared.reloadAllTimelines()
        call.resolve()
    }
}
