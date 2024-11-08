<template>
  <!--vuetify의 최상위 컴포넌트, vuetify 스타일, 레이아웃 적용하는 기본 구조-->
  <v-app>
    <!--vuetify의 주요 콘텐츠 영역을 정의하는 컴포넌트-->
    <v-main>
      <!--라우터의 컴포넌트, 현재 활성화된 라우트에 따라 페이지 폴더 내의 컴포넌트를 동적으로 로드하여 표시. 라우팅된 페이지들이 이 위치에 렌더링 됨 일반적으로 pages폴더 내에 위치하고 이건 관례임. 그러면 컴퓨터가
      pages안에 있는 index.vue파일을 어떻게 읽을 수 있냐? router/index.ts파일에 라우트 경로와 컴포넌트를 매핑하는 코드가 있음-->
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
//
</script>
