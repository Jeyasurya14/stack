import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.*

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0") {
        install(ContentNegotiation) { json() }
        routing {
            get("/") {
                call.respond(
                    buildJsonObject {
                        put("app", "{{PROJECT_NAME}}")
                        put("framework", "ktor")
                        put("db", "{{DB}}")
                        put("message", "Hello from Polystack!")
                    }
                )
            }
            get("/health") {
                call.respond(buildJsonObject { put("status", "ok") })
            }
        }
    }.start(wait = true)
}
