use tauri_plugin_shell::ShellExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .setup(|app| {
      // Lancer le sidecar Python au démarrage
      let sidecar = app.shell().sidecar("taskplex-backend").map_err(|e| e.to_string())?;
      let (mut rx, _child) = sidecar.spawn().map_err(|e| e.to_string())?;

      // Logguer la sortie du backend pour le debug
      tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
          if let tauri_plugin_shell::process::CommandEvent::Stdout(line) = event {
             let log = String::from_utf8(line).unwrap_or_default();
             println!("Backend: {}", log);
          }
        }
      });
      
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
