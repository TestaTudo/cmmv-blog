<template>
    <Navbar v-cloak />

    <div class="bg-neutral-50 dark:bg-neutral-900 z-10 relative">
        <div class="mx-auto z-10">
            <div class="flex">
                <router-view />
            </div>
        </div>
    </div>

    <CookieConsent />
</template>

<script setup lang="ts">
import Navbar from '../components/Navbar.vue'
import CookieConsent from '../../components/CookieConsent.vue'
import { useSettingsStore } from "../../store/settings";
import { useHead } from '@unhead/vue'
import { computed } from 'vue'

const settingsStore = useSettingsStore();

const scripts = computed(() => {
    const baseScripts = [];

    return [...baseScripts, ...settingsStore.googleAnalyticsScripts];
});

useHead({
    meta: computed(() => settingsStore.allMetaTags),

    link: [
        {
            rel: 'stylesheet',
            href: '/src/theme-default/style.css',
            media: 'all'
        },
        {
            rel: 'icon',
            type: 'image/ico',
            href: computed(() => settingsStore.faviconUrl)
        },
        { rel: 'preconnect', href: 'https://www.googletagmanager.com/' },
        { rel: 'preconnect', href: 'https://www.google-analytics.com/' },
        { rel: 'preconnect', href: 'https://www.googletag.com/' },
        { rel: 'preconnect', href: 'https://connect.facebook.net/' },
        { rel: 'preconnect', href: 'https://securepubads.g.doubleclick.net/' },
        { rel: 'preconnect', href: 'https://tpc.googlesyndication.com/' },
        { rel: 'preconnect', href: 'https://www.googletag.com/' },
        { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com/' },
        { rel: 'dns-prefetch', href: 'https://securepubads.g.doubleclick.net' }
    ],

    script: scripts
})
</script>
