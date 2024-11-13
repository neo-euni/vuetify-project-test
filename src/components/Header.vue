<template>
  <v-app>
    <v-container>
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

            <v-card-text>
              <v-list>
                <v-list-item
                  v-for="(patient, index) in patientList"
                  :key="index"
                  link
                  @click="createCase(patient, index)"
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
            </v-card-text>
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
                        <v-btn class="cancel-btn" @click="resetNewPatient"
                          >Cancel</v-btn
                        >
                      </div>
                    </v-form>

                    <!-- 알림 메시지 -->
                    <v-alert v-if="showAlert" type="error" dense text>
                      환자 필수 요소를 입력해주세요.
                    </v-alert>
                  </v-card-text>

                  <!-- 구강 이미지 케이스 세팅 -->
                  <v-card-title>Case Setting</v-card-title>
                  <v-row justify="center">
                    <v-col cols="11" md="11" lg="11">
                      <v-img
                        v-if="showMouthStructure"
                        src="@/assets/mouth-structure.png"
                        alt="Mouth Structure"
                        max-width="100%"
                        height="30rem"
                        contain
                        style="border: solid 1px #0cddcb; border-radius: 5px"
                      ></v-img>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
              <!-- import data영역 -->
              <v-col cols="6">
                <v-card class="ml-8">
                  <v-card-title>Import Data</v-card-title>
                  <v-card-text>
                    <v-file-input
                      id="fileInput-obj"
                      @change="handleFileChangeAndLoad"
                      label="Upload 3D Model (.obj)"
                      prepend-icon="mdi-file-upload"
                      outlined
                      dense
                      class="fixed-width-file-input"
                    ></v-file-input>
                    <div class="model-view-section">
                      <v-img
                        v-if="uploadedImage"
                        :src="uploadedImage"
                        alt="Uploaded Image"
                        max-width="100%"
                        contain
                      />
                    </div>
                  </v-card-text>

                  <v-row class="gap-4">
                    <v-col cols="6">
                      <v-card>
                        <v-card-title>Bite Jig View</v-card-title>
                        <v-card-text>
                          <div class="bite-jig-view-img-section">
                            <v-img
                              v-if="selectedGuideImage"
                              :src="selectedGuideImage"
                              alt="Selected Guide Image"
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
                            <v-img
                              src="@/assets/dot.png"
                            </v-img>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>

              <!-- select guide & jig 영역 -->
              <v-col cols="3">
                <v-card class="ml-8">
                  <v-card-title>Select Guide & Jig</v-card-title>
                  <v-card-text>
                    <v-row>
                      <!-- 4행 2열 그리드 레이아웃 생성 -->
                      <v-col cols="6" v-for="n in 8" :key="n" class="grid-item">
                        <v-card outlined class="jig-slot">
                          <v-card-text class="centered-image-container">
                            <v-btn
                              icon
                              @click="onGuideImageClick(n)"
                              class="guide-image-btn"
                            >
                              <v-img
                                v-if="guideImages && guideImages[n - 1]"
                                :src="guideImages[n - 1]"
                                alt="guideImages"
                                class="image"
                              ></v-img>
                            </v-btn>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </template>

        <template v-slot:item.3>
          <v-card title="Simulation" flat>...</v-card>
        </template>
        <template v-slot:item.4>
          <v-card title="Detection" flat>...</v-card>
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
import { ref } from "vue";
// 이미지 리스트 리소스 미리 로드
import img1 from "@/assets/1-preview.png";
import img2 from "@/assets/2-preview.png";
import img3 from "@/assets/3-preview.png";
import img4 from "@/assets/4-preview.png";
import img5 from "@/assets/5-preview.png";
import img6 from "@/assets/6-preview.png";
import img7 from "@/assets/7-preview.png";
import img8 from "@/assets/8-preview.png";

class Patient {
  name: string;
  id: string;
  gender: string;
  dob: string;
  memo: string;

  constructor(name = "", id = "", gender = "", dob = "", memo = "") {
    this.name = name;
    this.id = id;
    this.gender = gender;
    this.dob = dob;
    this.memo = memo;
  }

  reset() {
    this.name = "";
    this.id = "";
    this.gender = "";
    this.dob = "";
    this.memo = "";
  }
}

export default {
  setup() {
    const STEP: number = 1;
    const activeStep = ref(STEP);
    const patientList = ref([]);
    const newPatient = ref(new Patient());
    const today = ref(new Date().toISOString().split("T")[0]);
    const showMouthStructure = ref(false);
    const uploadedImage = ref<string | null>(null);
    const showAlert = ref(false);
    const guideImages = [img1, img2, img3, img4, img5, img6, img7, img8];
    const selectedGuideImage = ref<string | null>(null);

    function handleFileChangeAndLoad(event: Event) {
      const input = event.target as HTMLInputElement;
      const file = input.files ? input.files[0] : null;

      if (file) {
        // FileReader를 사용하여 이미지 파일을 URL로 변환
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedImage.value = e.target?.result as string;
        };
        reader.readAsDataURL(file); // 파일을 Data URL로 읽기
      }
    }

    function createPatient(event: Event) {
      activeStep.value++;
    }

    function saveNewPatient() {
      if (
        newPatient.value.name &&
        newPatient.value.id &&
        newPatient.value.gender &&
        newPatient.value.dob
      ) {
        patientList.value.unshift(
          new Patient(
            newPatient.value.name,
            newPatient.value.id,
            newPatient.value.gender,
            newPatient.value.dob,
            newPatient.value.memo
          )
        );
        showMouthStructure.value = true;

        resetNewPatient();
        activeStep.value = STEP;
      } else {
        showAlert.value = true;
        setTimeout(() => {
          showAlert.value = false;
        }, 3000);
        return;
      }
    }

    function resetNewPatient() {
      newPatient.value.reset();
    }

    function createCase(patient: Patient, index: number) {
      newPatient.value = patient;
      patientList.value.splice(index, 1);
      activeStep.value++;
    }

    function onGuideImageClick(slotNumber: number) {
      console.log(`Slot ${slotNumber} clicked`);
      selectedGuideImage.value = guideImages[slotNumber - 1];
    }

    // 그림판 기능

    return {
      activeStep,
      createPatient,
      patientList,
      newPatient,
      saveNewPatient,
      resetNewPatient,
      today,
      showMouthStructure,
      createCase,
      uploadedImage,
      handleFileChangeAndLoad,
      showAlert,
      onGuideImageClick,
      guideImages,
      selectedGuideImage,
    };
  },
};
</script>

<style scoped>
.new-patient-btn {
  padding: 4px 8px;
  font-size: 10px;
  margin-left: 150px;
  border: solid 1px #0cddcb;
}

.save-btn {
  font-size: 10px;
  padding: 4px 8px;
  border: solid 1px #0cddcb;
}

.cancel-btn {
  font-size: 10px;
  padding: 4px 8px;
  border: solid 1px rgb(250, 146, 139);
}

.new-patient-btns {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

::v-deep .v-text-field input {
  font-size: 0.9rem !important;
}

/* three.js css 시작 임시로 이미지만 띄우고 있음*/
.model-view-section {
  width: 100%;
  height: 500px;
  display: flex;
  border: 1px solid #0cddcb;
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
  height: 13rem;
  width: 100%;
  border: 1px solid #0cddcb;
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

.image {
  width: 12rem;
  object-fit: contain;
}

.bite-jig-view-img-section {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  border: solid 1px #0cddcb;
  width: 100%;
  height: 16rem;
}

.marker-section {
  display: flex;
  border-radius: 5px;
  border: solid 1px #0cddcb;
  width: 100%;
  height: 16rem;
}
</style>
