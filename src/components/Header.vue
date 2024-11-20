<template>
  <v-app>
    <v-container>
      <v-speed-dial
        :open-on-hover="false"
        location="right center"
        transition="slide-y-reverse-transition"
      >
        <template v-slot:activator="{ props: activatorProps }">
          <v-btn
            v-bind="activatorProps"
            icon
            :color="currentBorderColor"
            size="large"
          >
            <v-icon color="#ffffff">mdi-theme-light-dark</v-icon>
          </v-btn>
        </template>

        <!-- 버튼을 여기에 추가 -->
        <v-btn
          v-for="(theme, index) in themeList"
          :key="index"
          fab
          icon
          :color="theme.color"
          @click="changeTheme(theme.name)"
        >
          <v-icon :color="theme.borderColor">{{ theme.icon }}</v-icon>
        </v-btn>
      </v-speed-dial>

      <!-- 테마변경 -->

      <!-- <v-btn
        @click="toggleTheme"
        class="theme-toggle-btn"
        :color="isDarkMode ? 'button' : 'button'"
        elevation="8"
      >
        {{ isDarkMode ? "Light Mode" : "Dark Mode" }}
        &nbsp;
        <v-icon>{{
          isDarkMode ? "mdi-weather-sunny" : "mdi-weather-night"
        }}</v-icon>
      </v-btn> -->

      <!-- stepper 시작  -->
      <v-stepper
        v-model="activeStep"
        alt-labels
        editable
        :items="[
          'Home',
          'Create Case',
          'Simulation',
          'Detection',
          'Planning',
          'Guide',
        ]"
        class="mt-15 header-stepper"
      >
        <!-- Home 단계 -->
        <template v-slot:item.1>
          <v-card>
            <v-card-title>
              <span>Patient List</span>
              <v-btn small @click="createPatient" class="new-patient-btn"
                >New Patient</v-btn
              >
            </v-card-title>

            <v-list>
              <v-list-item
                v-for="(patient, index) in patientList"
                :key="index"
                link
                @click="loadPatientCase(patient, index)"
              >
                <v-list-item-content>
                  <v-list-item-title>{{ patient.name }}</v-list-item-title>
                  <v-list-item-subtitle
                    >ID: {{ patient.id }}, Gender: {{ patient.gender }}, DOB:
                    {{ patient.dob }}</v-list-item-subtitle
                  >
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </template>

        <!-- 2단계 -->
        <template v-slot:item.2>
          <v-container>
            <v-row justify="center">
              <v-col cols="3">
                <!-- 환자, case setting 영역 -->
                <v-card>
                  <v-card-title>New Patient Case</v-card-title>
                  <v-card-text>
                    <v-form ref="patientForm" @submit.prevent="saveNewPatient">
                      <v-row>
                        <!-- Name, ID, Gender, DOB 영역 -->
                        <v-col cols="6">
                          <v-text-field
                            v-model="newPatient.name"
                            label="Name"
                            required
                          ></v-text-field>
                          <v-text-field
                            v-model="newPatient.id"
                            label="ID"
                            required
                            unique
                          ></v-text-field>
                          <v-select
                            v-model="newPatient.gender"
                            :items="['Male', 'Female']"
                            label="Gender"
                            required
                          ></v-select>
                          <v-text-field
                            v-model="newPatient.dob"
                            label="Date of Birth"
                            type="date"
                            :max="today"
                            required
                          ></v-text-field>
                        </v-col>

                        <!-- Memo 영역 -->
                        <v-col cols="6">
                          <v-textarea
                            v-model="newPatient.memo"
                            label="Memo"
                            outlined
                            :rows="11"
                          ></v-textarea>
                        </v-col>
                      </v-row>

                      <div class="new-patient-btns">
                        <v-btn class="save-btn" @click="saveNewPatient"
                          >Save</v-btn
                        >
                        <v-btn class="cancel-btn" @click="cancelNewPatient"
                          >Cancel</v-btn
                        >
                      </div>
                    </v-form>
                  </v-card-text>

                  <!-- 알림 메시지 -->
                  <v-alert v-if="showAlert" type="error" dense>
                    환자 필수 요소를 입력해주세요.
                  </v-alert>

                  <!-- 구강 이미지 케이스 세팅 -->
                  <v-card-title>Case Setting</v-card-title>
                  <v-card-text>
                    <v-row justify="center">
                      <v-col cols="11" md="11" lg="11">
                        <v-img
                          v-if="showMouthStructure"
                          src="@/assets/mouth-structure.png"
                          alt="Mouth Structure"
                          max-width="100%"
                          height="30rem"
                          contain
                          style="
                            border: solid 1px rgb(var(--v-theme-borderColor));
                            border-radius: 5px;
                          "
                        ></v-img>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
              <!-- import data영역 -->
              <v-col cols="6">
                <v-card class="ml-4">
                  <v-card-title>Import Data</v-card-title>
                  <v-card-text>
                    <v-file-input
                      v-model="uploadedCtImage"
                      @change="updateCtImage"
                      label="Upload 3D Model (.obj)"
                      prepend-icon="mdi-file-upload"
                      outlined
                      class="fixed-width-file-input"
                    ></v-file-input>
                    <div class="model-view-section">
                      <v-img
                        v-if="selectedFileName"
                        :src="selectedFileName"
                        alt="Uploaded Image"
                        max-width="100%"
                        contain
                      />
                    </div>
                  </v-card-text>

                  <v-row class="gap-2">
                    <v-col cols="6">
                      <v-card>
                        <v-card-title>Bite Jig View</v-card-title>
                        <v-card-text>
                          <div class="bite-jig-view-img-section">
                            <v-img
                              v-if="selectedImage"
                              :src="selectedImage"
                              alt="Selected Image"
                              width="90%"
                              height="90%"
                              max-width="100%"
                              max-height="100%"
                            ></v-img>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                    <v-col cols="6">
                      <v-card>
                        <v-card-title>Marker</v-card-title>
                        <v-card-text>
                          <div class="marker-section">
                            <img
                              src="@/assets/dot.png"
                              alt="dot"
                              width="100%"
                              height="100%"
                            />
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>

              <!-- select guide & jig 영역 -->
              <v-col cols="3">
                <v-card class="ml-4">
                  <v-card-title>Select Guide & Jig</v-card-title>
                  <v-card>
                    <v-tabs v-model="activeTab" fixed-tabs>
                      <v-tab :value="1">Pre-Guide</v-tab>
                      <v-tab :value="2">Bite Jig</v-tab>
                    </v-tabs>

                    <v-tabs-window v-model="activeTab">
                      <v-tabs-window-item
                        v-for="tabValue in [1, 2]"
                        :key="tabValue"
                        :value="tabValue"
                      >
                        <v-container>
                          <v-row>
                            <v-col
                              cols="6"
                              v-for="n in 8"
                              :key="n"
                              class="grid-item"
                            >
                              <v-card outlined class="jig-slot">
                                <v-card-text class="centered-image-container">
                                  <v-btn
                                    icon
                                    @click="onGuideImageClick(n)"
                                    class="guide-image-btn"
                                  >
                                    <v-img
                                      v-if="tabValue === 1"
                                      :src="guideImages[n - 1]"
                                      alt="Guide Image"
                                      class="guide-image"
                                    ></v-img>
                                    <v-img
                                      v-if="tabValue === 2 && n <= 4"
                                      :src="jigImages[n - 1]"
                                      alt="Jig Image"
                                      class="guide-image"
                                    ></v-img>
                                  </v-btn>
                                </v-card-text>
                              </v-card>
                            </v-col>
                          </v-row>
                        </v-container>
                      </v-tabs-window-item>
                    </v-tabs-window>
                  </v-card>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </template>

        <template v-slot:item.3>
          <v-card title="Simulation" flat>...</v-card>
        </template>
        <template v-slot:item.4>
          <v-card title="Detection" flat>
            <v-card>
              <v-card-text>
                <v-row class="detection-step">
                  <!-- detection-view -->
                  <v-col cols="9">
                    <div class="detection-view">
                      <!-- <v-img src="@/assets/detection.png"></v-img> -->
                      <canvas
                        ref="detectionCanvas"
                        @mousedown="beginDrawing"
                        @mousemove="keepDrawing"
                        @mouseup="stopDrawing"
                        @mouseout="stopDrawing"
                      >
                      </canvas>
                    </div>
                  </v-col>

                  <!-- panoramic-view -->
                  <v-col cols="3">
                    <div class="panoramic-container">
                      <div class="panoramic-view">
                        <v-img
                          src="@/assets/panoramic.png"
                          width="100%"
                          height="100%"
                        ></v-img>
                      </div>
                      <div class="panoramic-view">
                        <v-img
                          src="@/assets/axial.png"
                          width="100%"
                          height="100%"
                        ></v-img>
                      </div>
                      <div class="panoramic-view">
                        <v-img
                          src="@/assets/orthogonal.png"
                          width="100%"
                          height="100%"
                        ></v-img>
                      </div>
                      <div class="panoramic-view">
                        <v-img
                          src="@/assets/tangential.png"
                          width="100%"
                          height="100%"
                        ></v-img>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-card>
        </template>

        <template v-slot:item.5>
          <v-card title="Planning" flat>...</v-card>
        </template>
        <template v-slot:item.6>
          <v-card title="Guide" flat>...</v-card>
        </template>
      </v-stepper>
    </v-container>
  </v-app>
</template>

<script lang="ts">
import { ref, onMounted, nextTick, watch } from "vue";
import { useTheme } from "vuetify";

class Patient {
  name: string;
  id: string;
  gender: string;
  dob: string;
  memo: string;
  uploadedCtImage: File | null;
  selectedFileName: string;
  selectedImage: string | null;

  constructor(
    name = "",
    id = "",
    gender = "",
    dob = "",
    memo = "",
    uploadedCtImage: File | null = null,
    selectedFileName = "",
    selectedImage: string | null = null
  ) {
    this.name = name;
    this.id = id;
    this.gender = gender;
    this.dob = dob;
    this.memo = memo;
    this.uploadedCtImage = uploadedCtImage;
    this.selectedFileName = selectedFileName;
    this.selectedImage = selectedImage;
  }

  reset() {
    this.name = "";
    this.id = "";
    this.gender = "";
    this.dob = "";
    this.memo = "";
    this.uploadedCtImage = null;
    this.selectedImage = null;
    this.selectedFileName = "";
  }
}

export default {
  setup() {
    const STEP: number = 1;
    const activeStep = ref(STEP);
    const patientList = ref<Patient[]>([]);
    const newPatient = ref(new Patient());
    const today = ref(new Date().toISOString().split("T")[0]);
    const showMouthStructure = ref(false);
    const uploadedCtImage = ref<File | null>(null);
    const showAlert = ref(false);
    const guideImages = ref<string[]>([]);
    const jigImages = ref<string[]>([]);
    const selectedImage = ref<string | null>(null);
    const selectedFileName = ref<string>("");
    const selectedGuideAndJigCase: number = 1;
    const activeTab = ref(selectedGuideAndJigCase);

    //테마 변경
    const theme = useTheme();
    const currentTheme = ref(theme.global.name.value);
    const currentBorderColor = ref("rgb(var(--v-theme-borderColor))");

    const themeList = ref([
      {
        name: "light",
        color: "#FFFFFF",
        icon: "mdi-white-balance-sunny",
        borderColor: "rgb(var(--v-theme-borderColor))",
      },
      {
        name: "dark",
        color: "#FFFFFF",
        icon: "mdi-weather-night",
        borderColor: "rgb(var(--v-theme-borderColor))",
      },
      {
        name: "lightSecondary",
        color: "#FFFFFF",
        icon: "mdi-star-outline",
        borderColor: "rgb(var(--v-theme-borderColor))",
      },
      {
        name: "darkSecondary",
        color: "#FFFFFF",
        icon: "mdi-star",
        borderColor: "rgb(var(--v-theme-borderColor))",
      },
      {
        name: "bluePastel",
        color: "#FFFFFF",
        icon: "mdi-eyedropper",
        borderColor: "rgb(var(--v-theme-borderColor))",
      },
      {
        name: "pinkPastel",
        color: "#FFFFFF",
        icon: "mdi-pencil",
        borderColor: "rgb(var(--v-theme-borderColor))",
      },
    ]);
    function changeTheme(themeName: string) {
      currentTheme.value = themeName;
      theme.global.name.value = currentTheme.value;
    }

    // 다크모드 여부 확인
    // 반응형 데이터로 다크모드 여부 계산
    // const isDarkMode = computed(() => currentTheme.value === "dark");

    // function toggleTheme() {
    //   currentTheme.value = isDarkMode.value ? "light" : "dark";
    //   theme.global.name.value = currentTheme.value;
    // }

    // 그림판 기능
    const detectionCanvas = ref<HTMLCanvasElement | null>(null);
    const detectionCtx = ref<CanvasRenderingContext2D | null>(null);
    const x = ref(0);
    const y = ref(0);
    const isDrawing = ref(false);

    function initializeCanvas() {
      if (detectionCanvas.value) {
        console.log("Canvas context initialized");
        detectionCtx.value = detectionCanvas.value.getContext("2d");

        setCanvasDimensions(detectionCanvas.value);

        if (detectionCtx.value) {
          scaleCanvasForHighResolution(
            detectionCanvas.value,
            detectionCtx.value
          );
        }
      } else {
        console.log("Canvas is still null after nextTick");
      }
    }

    function scaleCanvasForHighResolution(
      canvas: HTMLCanvasElement,
      ctx: CanvasRenderingContext2D
    ) {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      // ctx.scale(dpr, dpr);
      ctx.scale(1, 1);
    }

    function setCanvasDimensions(canvas: HTMLCanvasElement) {
      const canvasWidth = canvas.clientWidth;
      const canvasHeight = canvas.clientHeight;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }

    function drawLine(x1: number, y1: number, x2: number, y2: number) {
      if (detectionCtx.value) {
        detectionCtx.value.beginPath();
        detectionCtx.value.strokeStyle = "#8419EE";
        detectionCtx.value.lineWidth = 5;
        detectionCtx.value.moveTo(x1, y1);
        detectionCtx.value.lineTo(x2, y2);
        detectionCtx.value.stroke();
        detectionCtx.value.closePath();
      }
    }

    function getMousePosition(e: MouseEvent) {
      const rect = detectionCanvas.value.getBoundingClientRect();
      const scaleX = detectionCanvas.value.width / rect.width;
      const scaleY = detectionCanvas.value.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }

    function beginDrawing(e: MouseEvent) {
      const position = getMousePosition(e);
      x.value = position.x;
      y.value = position.y;
      isDrawing.value = true;
    }

    function keepDrawing(e: MouseEvent) {
      if (isDrawing.value) {
        const position = getMousePosition(e);
        drawLine(x.value, y.value, position.x, position.y);
        x.value = position.x;
        y.value = position.y;
      }
    }

    function stopDrawing() {
      isDrawing.value = false;
    }

    watch(activeStep, async (newStep: number) => {
      if (newStep === 4) {
        await nextTick();
        initializeCanvas();
      }
    });

    //file을 url로 변환하여 화면에 로드함
    function convertFileToUrl(file: File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedFileName.value = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }

    function updateCtImage(event: Event) {
      const input = event.target as HTMLInputElement;
      const file = input.files ? input.files[0] : null;

      if (file) {
        uploadedCtImage.value = file;
        selectedFileName.value = file.name;
        convertFileToUrl(file);
      }
    }

    function createPatient() {
      activeStep.value++;
      cancelNewPatient();
    }

    function cancelNewPatient() {
      newPatient.value.reset();
      uploadedCtImage.value = null;
      selectedFileName.value = "";
      selectedImage.value = null;
    }

    function insertNewPatient(patient: Patient) {
      patientList.value.unshift(
        new Patient(
          patient.name,
          patient.id,
          patient.gender,
          patient.dob,
          patient.memo,
          patient.uploadedCtImage,
          patient.selectedFileName,
          patient.selectedImage
        )
      );
    }

    function isPatientInfoValid(patient: Patient) {
      return patient.name && patient.id && patient.gender && patient.dob;
    }

    function showAlertMessage() {
      showAlert.value = true;
      setTimeout(() => {
        showAlert.value = false;
      }, 3000);
    }

    function saveNewPatient() {
      if (isPatientInfoValid(newPatient.value)) {
        newPatient.value.uploadedCtImage = uploadedCtImage.value;
        newPatient.value.selectedImage = selectedImage.value || "";

        insertNewPatient(newPatient.value);
        showMouthStructure.value = true;
        activeStep.value = STEP;
      } else {
        showAlertMessage();
      }
    }

    function loadPatientCase(patient: Patient, index: number) {
      newPatient.value = patient;
      selectedImage.value = patient.selectedImage;
      selectedFileName.value = patient.selectedFileName;
      uploadedCtImage.value = patient.uploadedCtImage;

      if (uploadedCtImage.value) {
        convertFileToUrl(uploadedCtImage.value);
      }
      patientList.value.splice(index, 1);
      activeStep.value++;
    }

    function onGuideImageClick(slotNumber: number) {
      console.log(`Slot ${slotNumber} clicked`);
      if (activeTab.value === 1) {
        selectedImage.value = guideImages.value[slotNumber - 1];
      } else if (activeTab.value === 2 && slotNumber <= 4) {
        selectedImage.value = jigImages.value[slotNumber - 1];
      }
    }

    onMounted(() => {
      // guideImages 초기화
      for (let i = 1; i <= 8; i++) {
        import(`@/assets/guide${i}.png`).then((module) => {
          guideImages.value.push(module.default);
        });
      }

      // jigImages 초기화
      for (let i = 1; i <= 4; i++) {
        import(`@/assets/jig${i}.png`).then((module) => {
          jigImages.value.push(module.default);
        });
      }
    });

    function onJigImageClick(slotNumber: number) {
      selectedImage.value = jigImages.value[slotNumber - 1];
    }

    return {
      activeStep,
      createPatient,
      patientList,
      newPatient,
      saveNewPatient,
      cancelNewPatient,
      today,
      showMouthStructure,
      loadPatientCase,
      uploadedCtImage,
      updateCtImage,
      showAlert,

      // 지그 선택 기능
      onGuideImageClick,
      onJigImageClick,
      guideImages,
      jigImages,
      activeTab,
      selectedImage,
      selectedFileName,

      // 테마변경
      currentTheme,
      themeList,
      changeTheme,
      currentBorderColor,

      // 그림판 기능
      detectionCanvas,
      beginDrawing,
      keepDrawing,
      stopDrawing,
    };
  },
};
</script>

<style scoped>
.header-stepper {
  border-radius: 5px;
}
.new-patient-btn {
  padding: 4px 8px;
  font-size: 10px;
  margin-left: 150px;
  border: solid 1px rgb(var(--v-theme-borderColor));
}

.save-btn {
  font-size: 10px;
  padding: 4px 8px;
  border: solid 1px rgb(var(--v-theme-borderColor));
}

.cancel-btn {
  font-size: 10px;
  padding: 4px 8px;
  border: solid 1px rgb(var(--v-theme-cancelButton));
}

.new-patient-btns {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* three.js css 시작 임시로 이미지만 띄우고 있음*/
.model-view-section {
  width: 100%;
  height: 500px;
  display: flex;
  border: 1px solid rgb(var(--v-theme-borderColor));
  border-radius: 5px;
  justify-content: center;
  align-items: center;
}

/* file select 시작*/
.fixed-width-file-input {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
}

/* 지그 선택 버튼 */
.jig-slot {
  height: 12rem;
  width: 100%;
  border: 1px solid rgb(var(--v-theme-borderColor));
  border-radius: 5px;
}

.centered-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.guide-image-btn {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.guide-image {
  width: 10rem; /* 컨테이너의 너비에 맞추기 */
  max-width: 12rem; /* 최대 너비 설정 */
  max-height: 100%; /* 최대 높이 설정 */
  object-fit: contain;
}

.bite-jig-view-img-section {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  border: solid 1px rgb(var(--v-theme-borderColor));
  width: 100%;
  height: 17rem;
}

.marker-section {
  display: flex;
  border-radius: 5px;
  border: solid 1px rgb(var(--v-theme-borderColor));
  width: 100%;
  height: 17rem;
}

.detection-step {
  display: flex;
  align-items: center;
  width: 100%;
  height: 70vh;
}

.detection-view {
  width: 100%;
  display: flex;
  border-radius: 5px;
  border: solid 1px rgb(var(--v-theme-borderColor));
}

.panoramic-container {
  display: grid;
  grid-template-rows: 1fr, 1fr;
  width: 100%;
  height: 100%;
  gap: 10px;
}

.panoramic-view {
  width: 100%;
  height: 100%;
  border-radius: 5px;
  border: solid 1px rgb(var(--v-theme-borderColor));
}

canvas {
  cursor: crosshair;
  background-image: url("@/assets/detection.png");
  background-position: center; /* 배경 이미지를 중앙에 위치 */
  background-size: cover; /* 배경 이미지가 요소의 크기에 맞게 조정되도록 설정 */
  background-repeat: no-repeat; /* 배경 이미지 반복 없음 */
  width: 100%;
}
</style>
