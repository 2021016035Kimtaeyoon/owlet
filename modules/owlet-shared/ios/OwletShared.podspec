Pod::Spec.new do |s|
  s.name           = 'OwletShared'
  s.version        = '0.1.0'
  s.summary        = 'Shared state between the app and widgets'
  s.description    = 'App Group UserDefaults bridge'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }
  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
