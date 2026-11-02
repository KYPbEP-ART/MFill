{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  nativeBuildInputs = with pkgs; [
    pkg-config
    gcc
    cmake
    gnumake

    # Tauri v2 Linux requirements
    webkitgtk_4_1
    libsoup_3
    openssl
    dbus
    librsvg

    # GTK stack (автоматически подтянет pango, cairo, atk, harfbuzz, gdk-pixbuf и т.д.)
    gtk3

    # Node/pnpm
    nodejs_22
    pnpm
  ];

  shellHook = ''
    # Nix автоматически собирает все пути к .pc-файлам из зависимостей выше
    export PKG_CONFIG_PATH="${pkgs.lib.makeSearchPathOutput "dev" "lib/pkgconfig" [
      pkgs.glib pkgs.gtk3 pkgs.cairo pkgs.pango pkgs.atk
      pkgs.gdk-pixbuf pkgs.webkitgtk_4_1 pkgs.libsoup_3 pkgs.openssl
    ]}:$PKG_CONFIG_PATH"
    
    export PATH="$PWD/node_modules/.bin:$PATH"
    unset LD_LIBRARY_PATH
    
    echo "✅ Tauri-окружение загружено. Запускай: pnpm tauri dev"
  '';
}