package org.bigbluebutton.common2.util

import org.bigbluebutton.common2.UnitSpec2

import scala.util.Success

class YamlUtilTest extends UnitSpec2 {

  // A small stand-in for settings.yml acting as the schema/catalog.
  val base: Map[String, Object] = Map(
    "public" -> Map[String, Object](
      "app" -> Map[String, Object](
        "breakouts" -> Map[String, Object](
          "captureWhiteboardByDefault" -> Boolean.box(false),
          "recordRoomByDefault"        -> Boolean.box(true)
        ),
        "preloadNextSlides" -> Int.box(2)
      ),
      "layout" -> Map[String, Object](
        "showScreenshareQuickSwapButton" -> Boolean.box(true)
      )
    )
  )

  "diffOverrideAgainstBase" should "report no issues for a valid nested override" in {
    val overrides = Map[String, Object](
      "public" -> Map[String, Object](
        "app" -> Map[String, Object](
          "breakouts" -> Map[String, Object](
            "recordRoomByDefault" -> Boolean.box(false)
          )
        )
      )
    )
    assert(YamlUtil.diffOverrideAgainstBase(base, overrides).isEmpty)
  }

  it should "flag a typo'd leaf key as unknown-key at the right path" in {
    val overrides = Map[String, Object](
      "public" -> Map[String, Object](
        "app" -> Map[String, Object](
          "breakouts" -> Map[String, Object](
            "captureWhitebordByDefault" -> Boolean.box(true) // typo
          )
        )
      )
    )
    val issues = YamlUtil.diffOverrideAgainstBase(base, overrides)
    assert(issues.size == 1)
    assert(issues.head.kind == "unknown-key")
    assert(issues.head.path == "public.app.breakouts.captureWhitebordByDefault")
  }

  it should "flag a typo'd nested section key as unknown-key" in {
    val overrides = Map[String, Object](
      "public" -> Map[String, Object](
        "ap" -> Map[String, Object]( // typo for "app"
          "preloadNextSlides" -> Int.box(0)
        )
      )
    )
    val issues = YamlUtil.diffOverrideAgainstBase(base, overrides)
    assert(issues.size == 1)
    assert(issues.head.kind == "unknown-key")
    assert(issues.head.path == "public.ap")
  }

  it should "flag a shape-mismatch when an object is given where base has a scalar" in {
    val overrides = Map[String, Object](
      "public" -> Map[String, Object](
        "app" -> Map[String, Object](
          "preloadNextSlides" -> Map[String, Object]("nested" -> Int.box(1))
        )
      )
    )
    val issues = YamlUtil.diffOverrideAgainstBase(base, overrides)
    assert(issues.size == 1)
    assert(issues.head.kind == "shape-mismatch")
    assert(issues.head.path == "public.app.preloadNextSlides")
  }

  it should "flag a shape-mismatch when a scalar is given where base has an object" in {
    val overrides = Map[String, Object](
      "public" -> Map[String, Object](
        "layout" -> "true" // base.public.layout is an object
      )
    )
    val issues = YamlUtil.diffOverrideAgainstBase(base, overrides)
    assert(issues.size == 1)
    assert(issues.head.kind == "shape-mismatch")
    assert(issues.head.path == "public.layout")
  }

  it should "flag a bool-vs-string type-mismatch at a leaf" in {
    val overrides = Map[String, Object](
      "public" -> Map[String, Object](
        "app" -> Map[String, Object](
          "breakouts" -> Map[String, Object](
            "recordRoomByDefault" -> "false" // string instead of boolean
          )
        )
      )
    )
    val issues = YamlUtil.diffOverrideAgainstBase(base, overrides)
    assert(issues.size == 1)
    assert(issues.head.kind == "type-mismatch")
    assert(issues.head.path == "public.app.breakouts.recordRoomByDefault")
  }

  it should "not flag Int-vs-Double (different parsers, same Number type class)" in {
    // base parsed as YAML (Int), override parsed as JSON (Double) — must not false-positive.
    val Success(yamlBase) = YamlUtil.toMap[Object]("public:\n  app:\n    preloadNextSlides: 2\n")
    val Success(jsonOverride) = JsonUtil.toMap[Object]("""{"public":{"app":{"preloadNextSlides":5}}}""")
    assert(YamlUtil.diffOverrideAgainstBase(yamlBase, jsonOverride).isEmpty)
  }

  it should "ignore the public.plugins subtree" in {
    val overrides = Map[String, Object](
      "public" -> Map[String, Object](
        "plugins" -> List(
          Map[String, Object]("name" -> "my-plugin", "anyArbitraryKey" -> Boolean.box(true))
        )
      )
    )
    assert(YamlUtil.diffOverrideAgainstBase(base, overrides).isEmpty)
  }
}
