<template>
  <v-app>
    <v-container>
      <v-stepper
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
              <v-btn
                small
                @click="showNewPatientForm.value = true"
                class="new-patient-btn"
                >New Patient</v-btn
              >
            </v-card-title>

            <v-card-text v-if="!showNewPatientForm.value">
              <v-list>
                <v-list-item
                  v-for="(patient, index) in patientList"
                  :key="index"
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

        <!-- 나머지 단계들 -->
        <template v-slot:item.2>
          <v-card title="Create Case" flat>...</v-card>
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

<script>
import { ref } from "vue";

export default {
  setup() {
    const showNewPatientForm = ref(false);
    const patientList = ref([
      { name: "John Doe", id: "001", gender: "Male", dob: "1990-01-01" },
      { name: "Jane Smith", id: "002", gender: "Female", dob: "1985-05-15" },
      { name: "Eunhee Park", id: "003", gender: "Male", dob: "1992-12-21" },
      { name: "Sim Smith", id: "004", gender: "Male", dob: "1985-05-15" },
      { name: "Jo Smith", id: "005", gender: "Female", dob: "1985-05-15" },
    ]);

    const newPatient = ref({
      name: "",
      id: "",
      gender: "",
      dob: "",
    });

    const addPatient = () => {
      if (
        newPatient.value.name &&
        newPatient.value.id &&
        newPatient.value.gender &&
        newPatient.value.dob
      ) {
        patientList.value.push({ ...newPatient.value });
        resetNewPatientForm();
      }
    };

    const cancelNewPatient = () => {
      resetNewPatientForm();
    };

    const resetNewPatientForm = () => {
      newPatient.value = { name: "", id: "", gender: "", dob: "" };
      showNewPatientForm.value = false;
    };

    return {
      showNewPatientForm,
      patientList,
      newPatient,
      addPatient,
      cancelNewPatient,
    };
  },
};
</script>

<style scoped>
.new-patient-btn {
  padding: 4px 8px;
  font-size: 10px;
  margin-left: 150px;
  border: solid 1px rgb(12, 221, 203);
}
</style>
