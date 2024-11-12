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
            <v-row justify="start">
              <v-card>
                <v-card-title>New Patient Case</v-card-title>
                <v-card-text>
                  <v-form ref="patientForm" @submit.prevent="saveNewPatient">
                    <v-row>
                      <!-- Name, ID, Gender, DOB 영역 -->
                      <v-col cols="5">
                        <v-text-field
                          v-model="newPatient.name"
                          label="Name"
                          required
                        ></v-text-field>
                        <v-text-field
                          v-model="newPatient.id"
                          label="ID"
                          required
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
                      <v-col cols="7">
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

                  <!-- 환자 저장 시 치아 이미지 뜸 -->
                  <v-card-title>Case Setting</v-card-title>
                  <v-img
                    v-if="showMouthStructure"
                    src="@/assets/mouth-structure.png"
                    alt="Mouth Structure"
                    max-width="400"
                    cover
                    style="border: solid 1px #0cddcb"
                    border-radius="5px"
                  ></v-img>
                </v-card-text>
              </v-card>
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

  // 필요한 메서드를 추가할 수 있습니다.
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
    const STEP: number = 1; // 초기 단계 설정
    const activeStep = ref(STEP);
    const patientList = ref([]);
    const newPatient = ref(new Patient());
    const today = ref(new Date().toISOString().split("T")[0]);
    const showMouthStructure = ref(false);

    /**
     * @Description 클릭이벤트를 받으면 현재 단계를 1 증가 시킴 template에 v-model로 바인딩 되어 현재 단계를 화면에 반영시킴
     * @param event
     * @return void
     */
    function createPatient(event: Event) {
      activeStep.value++;
    }

    /**
     * @Description 사용자가 입력한 환자 정보를 환자 리스트에 추가
     * @return void
     */
    function saveNewPatient() {
      if (
        newPatient.value.name &&
        newPatient.value.id &&
        newPatient.value.gender &&
        newPatient.value.dob
      ) {
        // 환자리스트에 저장한 환자 객체 추가
        patientList.value.push(
          new Patient(
            newPatient.value.name,
            newPatient.value.id,
            newPatient.value.gender,
            newPatient.value.dob
          )
        );
        showMouthStructure.value = true;

        resetNewPatient();
        activeStep.value = STEP;
      }
    }

    /**
     * @Description 사용자가 입력한 환자 정보를 초기화
     * @return void
     */
    function resetNewPatient() {
      newPatient.value.reset();
    }

    /**
     * @Description 환자 리스트에서 선택한 환자 정보를 가지고 케이스 생성 화면으로 이동
     * @param patient, index
     * @return void
     */
    function createCase(patient: Patient, index: number) {
      newPatient.value = patient;
      patientList.value.splice(index, 1);
      activeStep.value++;
    }

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
</style>
