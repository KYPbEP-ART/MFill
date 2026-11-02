// Предотвращает появление лишнего консольного окна в релизе на Windows
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // 👇 Вызываем run() из lib.rs
    // Имя должно совпадать с [lib] name в Cargo.toml
    constructor_lib::run();
}