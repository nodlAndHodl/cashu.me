<template>
  <q-layout view="lHh Lpr lFf">
    <MainHeader />
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import MainHeader from "components/MainHeader.vue";
import windowMixin from "src/boot/mixin";

export default defineComponent({
  name: "MainLayout",
  mixins: [windowMixin],
  components: {
    MainHeader,
  },
});
</script>
