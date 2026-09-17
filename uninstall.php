<?php

if (! defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

delete_option('wp_cu_translator_settings');
delete_option('wp_cu_translator_installation_id');
