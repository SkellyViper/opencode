import { describe, expect, test } from "bun:test"

import { matchLocale } from "./locales"

describe("matchLocale", () => {
  describe("unparseable input", () => {
    test("returns null for empty and whitespace-only input", () => {
      expect(matchLocale("")).toBeNull()
      expect(matchLocale("   ")).toBeNull()
    })

    test("returns null for malformed percent-encoding", () => {
      expect(matchLocale("%")).toBeNull()
      expect(matchLocale("%E0%A4")).toBeNull()
    })
  })

  describe("normalization via parse()", () => {
    test("decodes percent-encoding before matching", () => {
      expect(matchLocale("zh%2DHant")).toBe("zh-tw")
    })

    test("trims surrounding whitespace and lowercases", () => {
      expect(matchLocale("  FR-fr  ")).toBe("fr")
      expect(matchLocale("DE")).toBe("de")
      expect(matchLocale("EN")).toBe("root")
    })
  })

  describe("Chinese handling (matchChineseLocale)", () => {
    test("bare zh and simplified variants map to zh-cn", () => {
      expect(matchLocale("zh")).toBe("zh-cn")
      expect(matchLocale("zh-cn")).toBe("zh-cn")
      expect(matchLocale("zh-CN")).toBe("zh-cn")
      expect(matchLocale("zh-Hans")).toBe("zh-cn")
      expect(matchLocale("zh-yue")).toBe("zh-cn")
    })

    test("traditional markers (hant, -tw, -hk, -mo) map to zh-tw", () => {
      expect(matchLocale("zh-Hant")).toBe("zh-tw")
      expect(matchLocale("zh-TW")).toBe("zh-tw")
      expect(matchLocale("zh-HK")).toBe("zh-tw")
      expect(matchLocale("zh-MO")).toBe("zh-tw")
      expect(matchLocale("zh-tw-hk")).toBe("zh-tw")
    })

    test("zh-prefix check wins over the 'zht' alias", () => {
      // "zht" is an alias for "zh-tw" in exactLocale, but matchLocale's
      // startsWith("zh") branch runs first and sees no traditional marker.
      expect(matchLocale("zht")).toBe("zh-cn")
    })
  })

  describe("exact alias hits (matchLocaleAlias)", () => {
    test("resolves aliases that are not reachable by prefix rules", () => {
      expect(matchLocale("br")).toBe("pt-br")
      expect(matchLocale("en")).toBe("root")
      expect(matchLocale("root")).toBe("root")
    })

    test("resolves norwegian aliases", () => {
      expect(matchLocale("nb")).toBe("nb")
      expect(matchLocale("nn")).toBe("nb")
      expect(matchLocale("no")).toBe("nb")
    })

    test("resolves portuguese aliases", () => {
      expect(matchLocale("pt")).toBe("pt-br")
      expect(matchLocale("pt-br")).toBe("pt-br")
    })
  })

  describe("prefix fallback (matchLocalePrefix)", () => {
    test("any pt* value maps to pt-br", () => {
      expect(matchLocale("pt-pt")).toBe("pt-br")
      expect(matchLocale("pt_br")).toBe("pt-br")
      expect(matchLocale("ptbr")).toBe("pt-br")
    })

    test("any no*/nb*/nn* value maps to nb", () => {
      expect(matchLocale("nb-no")).toBe("nb")
      expect(matchLocale("no-bok")).toBe("nb")
      expect(matchLocale("nn-no")).toBe("nb")
      expect(matchLocale("nob")).toBe("nb")
      expect(matchLocale("norwegian")).toBe("nb")
    })

    test("region-suffixed tags fall back through the starts table", () => {
      expect(matchLocale("ko-kr")).toBe("ko")
      expect(matchLocale("bs-BA")).toBe("bs")
      expect(matchLocale("de-DE")).toBe("de")
      expect(matchLocale("es-419")).toBe("es")
      expect(matchLocale("fr-CA")).toBe("fr")
      expect(matchLocale("it-IT")).toBe("it")
      expect(matchLocale("da-DK")).toBe("da")
      expect(matchLocale("ja-JP")).toBe("ja")
      expect(matchLocale("pl-PL")).toBe("pl")
      expect(matchLocale("ru-RU")).toBe("ru")
      expect(matchLocale("uk-UA")).toBe("uk")
      expect(matchLocale("th-TH")).toBe("th")
      expect(matchLocale("tr-TR")).toBe("tr")
    })

    test("en* prefix resolves to root", () => {
      expect(matchLocale("en-US")).toBe("root")
      expect(matchLocale("english")).toBe("root")
    })
  })

  describe("unsupported input", () => {
    test("returns null when no branch matches", () => {
      expect(matchLocale("xx")).toBeNull()
      expect(matchLocale("klingon")).toBeNull()
      expect(matchLocale("jp")).toBeNull()
      expect(matchLocale("zz-ZZ")).toBeNull()
      expect(matchLocale("fi")).toBeNull()
      expect(matchLocale("nl")).toBeNull()
    })
  })
})
