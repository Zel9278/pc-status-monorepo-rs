use axum::{
    routing::get,
    Router,
};
use tower::ServiceBuilder;
use tower_http::{
    cors::{CorsLayer, Any},
    services::ServeDir,
};

use crate::websocket::WebSocketServer;

pub fn create_http_server(ws_server: WebSocketServer) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        .route("/ws", get(WebSocketServer::handle_websocket_upgrade))
        .route("/server", get(WebSocketServer::handle_websocket_upgrade))
        .with_state(ws_server)
        .layer(ServiceBuilder::new().layer(cors))
        .fallback_service(ServeDir::new("frontend/dist").fallback(ServeDir::new("frontend/dist/index.html")))
}


