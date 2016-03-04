//enablePlugins(JavaServerAppPackaging)
enablePlugins(JettyPlugin)

name := "bbb-deskshare-akka"

organization := "org.bigbluebutton"

version := "0.0.1"

scalaVersion  := "2.11.6"
//scalaVersion  := "2.11.7"

scalacOptions ++= Seq(
  "-unchecked",
  "-deprecation",
  "-Xlint",
  "-Ywarn-dead-code",
  "-language:_",
  "-target:jvm-1.8", //TODO this was 1.7
  "-encoding", "UTF-8"
)

resolvers ++= Seq(
  "spray repo" at "http://repo.spray.io/",
  "rediscala" at "http://dl.bintray.com/etaty/maven",
  "blindside-repos" at "http://blindside.googlecode.com/svn/repository/"
)

publishTo := Some(Resolver.file("file",  new File(Path.userHome.absolutePath+"/dev/repo/maven-repo/releases" )) )

// We want to have our jar files in lib_managed dir.
// This way we'll have the right path when we import
// into eclipse.
retrieveManaged := true

//testOptions in Test += Tests.Argument(TestFrameworks.Specs2, "html", "console", "junitxml")
//
//testOptions in Test += Tests.Argument(TestFrameworks.ScalaTest, "-h", "target/scalatest-reports")

libraryDependencies ++= {
  val akkaVersion  = "2.3.11"
//  val akkaVersion  = "2.4.2"
  Seq(
    "com.typesafe.akka"        %%  "akka-actor"        % akkaVersion,
    "com.typesafe.akka"        %%  "akka-testkit"      % akkaVersion    % "test",
    "com.typesafe.akka"        %%  "akka-slf4j"        % akkaVersion,
    "com.typesafe"              %  "config"            % "1.3.0", //TODO JUST ADDED
    "ch.qos.logback"            %  "logback-classic"   % "1.0.13" % "runtime",
//    "org.pegdown"               %  "pegdown"           % "1.4.0",
//    "junit"                     %  "junit"             % "4.11",
//    "com.etaty.rediscala"      %%  "rediscala"         % "1.4.0",
    "commons-codec"             %  "commons-codec"     % "1.8",
//    "redis.clients"             %  "jedis"             % "2.7.2",
//    "org.apache.commons"        %  "commons-lang3"     % "3.2",
    "org.red5"                  %  "red5-server"       % "1.0.6-RELEASE", //NOTE this can't be runtime
//    "com.google.code.gson"      %  "gson"              % "1.7.1",
    "org.springframework"       %  "spring-web"        % "4.1.7.RELEASE",
    "org.springframework"       %  "spring-beans"      % "4.1.7.RELEASE",
    "org.springframework"       %  "spring-context"    % "4.1.7.RELEASE",
    "org.springframework"       %  "spring-core"       % "4.1.7.RELEASE",
    "org.springframework"       %  "spring-webmvc"     % "4.1.7.RELEASE",
    "org.springframework"       %  "spring-aop"        % "4.1.7.RELEASE",
    "javax.servlet"             %  "servlet-api"       % "2.5"


  )}

//seq(Revolver.settings: _*)
//
//scalariformSettings


//-----------
// Packaging
//
// Reference:
// https://github.com/muuki88/sbt-native-packager-examples/tree/master/akka-server-app
// http://www.scala-sbt.org/sbt-native-packager/index.html
//-----------
mainClass := Some("org.bigbluebutton.deskshare.Boot")

maintainer in Linux := "Richard Alam <ritzalam@gmail.com>"

packageSummary in Linux := "BigBlueButton Apps (Akka)"

packageDescription := """BigBlueButton Deskshare in Akka."""

val user = "bigbluebutton"

val group = "bigbluebutton"

// user which will execute the application
daemonUser in Linux := user

// group which will execute the application
daemonGroup in Linux := group



//debianPackageDependencies in Debian ++= Seq("java8-runtime-headless", "bash")


// Automatically find def main(args:Array[String]) methods from classpath
//packAutoSettings