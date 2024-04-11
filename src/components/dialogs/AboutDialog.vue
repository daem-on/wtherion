<script setup lang="ts">
import { getVersionNumber } from "../../filesio/configManagement";
import logoUrl from "../../../assets/logo-cropped.png"

const build = __BUILD_DATE__;
</script>

<template>
	<div>
		<img :src="logoUrl" width=600>
		<p>
			<b>wtherion</b>
			version {{ getVersionNumber() }}
			build {{ build }}
			{{ $t(`translationCredits`) }}
			Created by Csongor Zih, based on
			<a href="https://github.com/w00dn/papergrapher" target="_blank">papergrapher</a>, created by Rolf Fleischmann.
			Powered by <a href="http://paperjs.org/" target="_blank">Paper.js</a>. Published under the MIT license.
		</p>
	</div>
</template>

<style scoped>
p {
	padding: 0.5em;
	width: 600px;
}

b {
	font-weight: bold;
}
</style>