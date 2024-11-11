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
        <template v-slot:item.1>
          <v-card>
            <v-card-title>
              <span>Patient List</span>
              <v-btn small color="primary" @click="showNewPatientForm = true"
                >New Patient</v-btn
              >
            </v-card-title>

            <v-card-text v-if="!showNewPatientForm">
              <v-list>
                <!-- 여기에 환자 목록이 출력됩니다. 예시: -->
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

            <v-card-text v-else>
              <!-- New Patient Form -->
              <v-form ref="patientForm" @submit.prevent="addPatient">
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
                  required
                ></v-text-field>
                <v-btn color="primary" @click="addPatient">Save</v-btn>
                <v-btn @click="cancelNewPatient">Cancel</v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </template>

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

<style></style>
