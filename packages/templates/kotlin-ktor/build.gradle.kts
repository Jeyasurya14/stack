plugins {
    kotlin("jvm") version "1.9.24"
    application
}

group = "com.polystack"
version = "0.1.0"

repositories {
    mavenCentral()
}

application {
    mainClass.set("MainKt")
}

dependencies {
    implementation("io.ktor:ktor-server-core-jvm:2.3.12")
    implementation("io.ktor:ktor-server-netty-jvm:2.3.12")
    implementation("io.ktor:ktor-server-content-negotiation-jvm:2.3.12")
    implementation("io.ktor:ktor-serialization-kotlinx-json-jvm:2.3.12")
    implementation("ch.qos.logback:logback-classic:1.5.6")
}

kotlin { jvmToolchain(17) }
