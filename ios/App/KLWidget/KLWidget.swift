import WidgetKit
import SwiftUI

/* Widget layar kunci dan layar utama: shalat berikutnya dengan hitung mundur, dan kalimat pengingat yang berganti tiap waktu shalat */
struct KLEntry: TimelineEntry {
    let date: Date
    let location: String
    let prayer: String
    let time: String
    let nextAt: Date?
    let message: String
}

struct KLPayload: Decodable {
    struct Slot: Decodable { let at: Double; let prayer: String; let time: String; let text: String }
    let location: String
    let slots: [Slot]
}

struct KLProvider: TimelineProvider {
    func placeholder(in context: Context) -> KLEntry {
        KLEntry(date: Date(), location: "Kisah Lillah", prayer: "Ashar 14:48", time: "14:48", nextAt: nil, message: "Jaga istiqomah.")
    }

    func getSnapshot(in context: Context, completion: @escaping (KLEntry) -> Void) {
        completion(load(at: Date()) ?? placeholder(in: context))
    }

    /* Satu entri untuk setiap waktu shalat, sehingga kalimat dan shalat berikutnya berganti tepat waktunya */
    func getTimeline(in context: Context, completion: @escaping (Timeline<KLEntry>) -> Void) {
        let now = Date()
        var entries: [KLEntry] = []
        if let payload = read() {
            let starts = payload.slots.map { Date(timeIntervalSince1970: $0.at / 1000) }.sorted()
            entries.append(make(payload, at: now))
            for s in starts where s > now {
                entries.append(make(payload, at: s))
            }
        } else {
            entries.append(placeholder(in: context))
        }
        completion(Timeline(entries: entries, policy: .atEnd))
    }

    private func read() -> KLPayload? {
        guard let raw = UserDefaults(suiteName: KLWidgetShared.group)?.string(forKey: KLWidgetShared.key),
              let data = raw.data(using: .utf8) else { return nil }
        return try? JSONDecoder().decode(KLPayload.self, from: data)
    }

    private func load(at date: Date) -> KLEntry? {
        read().map { make($0, at: date) }
    }

    private func make(_ p: KLPayload, at date: Date) -> KLEntry {
        let ms = date.timeIntervalSince1970 * 1000
        let past = p.slots.filter { $0.at <= ms }.max { $0.at < $1.at }
        let next = p.slots.filter { $0.at > ms }.min { $0.at < $1.at }
        return KLEntry(
            date: date,
            location: p.location,
            prayer: next.map { "\($0.prayer) \($0.time)" } ?? "Buka aplikasi",
            time: next?.time ?? "",
            nextAt: next.map { Date(timeIntervalSince1970: $0.at / 1000) },
            message: past?.text ?? ""
        )
    }
}

struct KLWidgetView: View {
    var entry: KLEntry
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(entry.location).font(.caption2).foregroundStyle(.white.opacity(0.85))
            Text(entry.prayer).font(.headline).bold().foregroundStyle(.white)
            if let at = entry.nextAt {
                Text(at, style: .timer).font(.caption).monospacedDigit().foregroundStyle(.white.opacity(0.9))
            }
            Spacer(minLength: 0)
            Text(entry.message).font(.footnote).foregroundStyle(.white).lineLimit(3)
        }
        .padding(12)
        .containerBackground(Color(red: 0.25, green: 0.44, blue: 0.37), for: .widget)
    }
}

@main
struct KLWidget: Widget {
    let kind = "KLWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: KLProvider()) { entry in
            KLWidgetView(entry: entry)
        }
        .configurationDisplayName("Kisah Lillah")
        .description("Shalat berikutnya dan pengingat istiqomah.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
