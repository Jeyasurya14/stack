use axum::{routing::get, Json, Router};
use serde_json::{json, Value};

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .expect("failed to bind");
    println!("{{PROJECT_NAME}} listening on http://localhost:3000");
    axum::serve(listener, app).await.unwrap();
}

async fn root() -> Json<Value> {
    Json(json!({
        "app": "{{PROJECT_NAME}}",
        "framework": "axum",
        "db": "{{DB}}",
        "message": "Hello from Polystack!"
    }))
}

async fn health() -> Json<Value> {
    Json(json!({ "status": "ok" }))
}
