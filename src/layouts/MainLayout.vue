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
import mixin from "src/boot/mixin";

export default defineComponent({
  name: "MainLayout",
  mixins: [mixin],
  components: {
    MainHeader,
  },
});
</script>
