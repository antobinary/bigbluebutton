# frozen_string_literal: true

require 'minitest/autorun'
require 'tmpdir'

require 'recordandplayback'

class TestReadProps < Minitest::Test
  def test_returns_base_props_when_override_missing
    props = BigBlueButton.read_props(override_path: '/nonexistent/recording.yml')

    assert_kind_of(Hash, props)
    refute_nil(props['playback_host'])
  end

  def test_override_merges_over_base_props
    Dir.mktmpdir do |dir|
      override = File.join(dir, 'recording.yml')
      File.write(override, "playback_host: override.example.com\n")

      props = BigBlueButton.read_props(override_path: override)

      assert_equal('override.example.com', props['playback_host'])
      refute_nil(props['recording_dir'])
    end
  end

  def test_rereads_override_on_each_call
    Dir.mktmpdir do |dir|
      override = File.join(dir, 'recording.yml')

      File.write(override, "playback_host: first.example.com\n")
      assert_equal('first.example.com', BigBlueButton.read_props(override_path: override)['playback_host'])

      File.write(override, "playback_host: second.example.com\n")
      assert_equal('second.example.com', BigBlueButton.read_props(override_path: override)['playback_host'])
    end
  end

  def test_empty_override_file_is_ignored
    Dir.mktmpdir do |dir|
      override = File.join(dir, 'recording.yml')
      File.write(override, '')

      props = BigBlueButton.read_props(override_path: override)

      assert_kind_of(Hash, props)
      refute_nil(props['playback_host'])
    end
  end
end
